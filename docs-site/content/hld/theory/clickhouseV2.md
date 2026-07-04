# ClickHouse Interview Guide

## 1. What Is ClickHouse & Why It Exists

ClickHouse is an **open-source, column-oriented OLAP (analytical) database**, built by Yandex, designed for real-time analytical queries over massive datasets using SQL.

**Key positioning:**
- Not a replacement for OLTP databases (Postgres, MySQL) — it's terrible at single-row inserts/updates/deletes.
- Built for: aggregations, scans, and analytics over billions/trillions of rows, with sub-second latency.
- Used by: Cloudflare, Uber, eBay, Lyft — anywhere you need fast analytics on huge event/log/metrics data.

**Interview soundbite:** "ClickHouse trades transactional guarantees and easy mutability for extreme scan/aggregation speed via columnar storage, vectorized execution, and aggressive compression."

---

## 2. Row-Oriented vs Column-Oriented Storage

This is the #1 concept interviewers probe.

**Row-oriented (Postgres/MySQL):** all columns of a row stored together on disk.
- Good for: fetching/updating whole rows (OLTP) — `SELECT * FROM users WHERE id=5`
- Bad for: `SELECT AVG(age) FROM users` — you read every column even though you need one.

**Column-oriented (ClickHouse):** each column stored separately, contiguously.
- Good for: aggregating over a few columns across billions of rows — only touches needed columns.
- Compression is far better — similar values sit next to each other (e.g., all timestamps together, all "country" values together) → higher compression ratios, less I/O.
- Bad for: retrieving many columns for one specific row (requires reading from many separate column files).

**Why this matters for compression:** columns with low cardinality/repeated values (e.g., `status`, `country_code`) compress extremely well when stored together — this is why ClickHouse can achieve 10-100x compression on typical analytical data.

---

## 3. The MergeTree Engine Family (core of ClickHouse)

`MergeTree` and its variants are the primary storage engines and the single most important interview topic.

### How MergeTree works
1. Data is inserted in **batches** called **parts** (immutable on-disk directories).
2. Each part is **sorted by the primary key** (ORDER BY) before being written.
3. A background process periodically **merges** smaller parts into larger ones (hence the name) — reducing part count and reapplying sort order.
4. This merge process is also how `ReplacingMergeTree`, `SummingMergeTree`, etc. do their special logic (dedup, summing) — **at merge time, not insert time**.

### Table creation example
```sql
CREATE TABLE events (
    event_date Date,
    event_time DateTime,
    user_id UInt64,
    event_type String,
    value Float64
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_type, user_id, event_time)
SETTINGS index_granularity = 8192;
```

### Key clauses to know cold
| Clause | Purpose |
|---|---|
| `ORDER BY` | Defines sort order of data **within each part** — this is your primary index. Choose based on most common filter/group columns. |
| `PARTITION BY` | Splits data into separate physical directories (e.g., by month). Enables partition pruning and easy dropping of old data (`DROP PARTITION`). |
| `PRIMARY KEY` | Usually same as (or prefix of) `ORDER BY`. Defines the sparse index. |
| `SAMPLE BY` | Enables approximate queries via `SAMPLE` clause. |
| `TTL` | Automatic expiration/movement of data (e.g., delete rows older than 90 days). |

### Common MergeTree variants
- **ReplacingMergeTree** — deduplicates rows with the same sort key during merges (keeps latest by version column). Good for "upsert-like" semantics, but dedup isn't guaranteed until merge happens (need `FINAL` or `OPTIMIZE` to force it).
- **SummingMergeTree** — automatically sums numeric columns for rows sharing the same sort key, during merges.
- **AggregatingMergeTree** — stores partial aggregation states (`AggregateFunction` columns), merged incrementally. Powers efficient rolling aggregates via materialized views.
- **CollapsingMergeTree / VersionedCollapsingMergeTree** — handles row updates by inserting "cancel" rows (sign = -1) and new rows (sign = +1), collapsed at merge time. Used for CDC-like patterns.
- **ReplicatedMergeTree** — adds replication via ZooKeeper/ClickHouse Keeper (prefix any of the above with `Replicated`, e.g., `ReplicatedReplacingMergeTree`).

**Interview trap:** merges are eventual/background, not immediate. `ReplacingMergeTree` won't give you fully deduplicated results in a plain `SELECT` unless you use `FINAL`, and `FINAL` is expensive. Alternative: use `GROUP BY` with `argMax()` to pick latest row manually — often faster than `FINAL`.

---

## 4. Primary Index & Sparse Indexing

ClickHouse's primary index is **not** like a B-tree index in MySQL/Postgres.

- Each part is divided into **granules** (default 8192 rows each, `index_granularity`).
- The primary index stores just **one row's key values per granule** (the first row of each granule) — this is why it's called a **sparse index**.
- On query, ClickHouse binary-searches this sparse index to find which granules *might* contain matching rows, then reads only those granules (not the whole column).

**Why order of ORDER BY columns matters:** Put your most selective / most frequently filtered column first, since the index can only efficiently skip data using a *prefix* of the sort key (like a compound index in relational DBs — you can't skip using the 2nd column without constraining the 1st).

### Skip indexes (secondary indexes)
For columns not in the primary key, you can add:
```sql
ALTER TABLE events ADD INDEX idx_value value TYPE minmax GRANULARITY 4;
```
Types: `minmax`, `set`, `bloom_filter`, `ngrambf_v1`, `tokenbf_v1` (for text search). These let ClickHouse skip granules where the value definitely isn't present, without a full column scan.

---

## 5. Distributed Architecture: Sharding & Replication

These are **orthogonal concepts** — a common interview clarification point.

- **Replication** = same data copied across multiple nodes for **fault tolerance** and read scaling. Achieved via `ReplicatedMergeTree` + ClickHouse Keeper (or legacy ZooKeeper) for coordination.
- **Sharding** = data **split** across multiple nodes for **write/storage scaling** (horizontal scale). ClickHouse doesn't auto-shard — you define a sharding key and use the `Distributed` table engine.

### Distributed table engine
A `Distributed` table is a **query router**, not real storage — it holds no data itself, just metadata about which shards to query.
```sql
CREATE TABLE events_distributed AS events
ENGINE = Distributed(my_cluster, default, events, rand());
```
Queries against it fan out to all shards, and results are merged/aggregated on the initiating node.

**Common combo:** each node has a local `ReplicatedMergeTree` table + a `Distributed` table on top for cluster-wide queries. This is often abbreviated as the "sharding + replication" standard topology.

**Interview question:** "How does ClickHouse achieve HA?" → Replication (multiple copies of each shard via Keeper-coordinated ReplicatedMergeTree) + Distributed engine routes around a dead replica.

---

## 6. Data Types Worth Knowing

- **Numeric:** `UInt8..UInt256`, `Int8..Int256`, `Float32/64`, `Decimal(P,S)` — always pick the smallest sufficient type; it directly impacts compression and speed.
- **String:** `String` (arbitrary length), `FixedString(N)` (fixed-length, faster if truly fixed).
- **LowCardinality(T)** — dictionary-encodes columns with few distinct values (e.g., country, status). Huge speed/compression win; you should proactively mention this in interviews as a real-world optimization.
- **Date / DateTime / DateTime64** — DateTime64 supports sub-second precision.
- **Array(T), Tuple, Map, Nested** — ClickHouse supports semi-structured data without needing a JSON blob, via Nested/Array columns.
- **Nullable(T)** — avoid overusing; Nullable columns have overhead (separate "is null" bitmap) and hurt performance. Prefer sentinel/default values where possible.
- **Enum8/Enum16** — efficient categorical storage with named values.

---

## 7. Materialized Views

A common point of confusion versus traditional DB materialized views.

- ClickHouse materialized views are **insert triggers**, not "refresh the whole view periodically."
- When you insert into the **source table**, the MV's query runs on just the **newly inserted block** and writes results into a **target table**.
- They do NOT reflect UPDATE/DELETE on the source, and they don't automatically backfill historical data (you must manually populate history with `INSERT INTO target SELECT ... FROM source` after creating the MV, or use `POPULATE`).

```sql
CREATE MATERIALIZED VIEW mv_daily_stats
ENGINE = SummingMergeTree()
ORDER BY (event_date, event_type)
AS
SELECT event_date, event_type, count() AS cnt, sum(value) AS total
FROM events
GROUP BY event_date, event_type;
```

This pattern (raw table → MV → AggregatingMergeTree/SummingMergeTree target) is THE standard way to do pre-aggregated rollups in ClickHouse and comes up constantly in system-design-style interview questions.

---

## 8. Query Execution Model

- **Vectorized execution:** operates on **blocks of columns** (batches, typically thousands of rows) rather than row-by-row, using SIMD instructions where possible. This is a major reason for ClickHouse's speed vs row-at-a-time engines.
- **Parallelism:** queries are split across multiple threads within a node and across shards in a cluster; results merged at the coordinator.
- Use `EXPLAIN` and `EXPLAIN PIPELINE` to inspect the query plan and execution pipeline — good to mention you know these exist.

---

## 9. Inserts, Mutations & Deletes — What's Different from OLTP

This trips up people coming from Postgres/MySQL backgrounds — expect a question here.

- **No row-level transactions.** Inserts are append-only, ideally in **large batches** (thousands of rows per insert), not one-row-at-a-time — small frequent inserts create too many tiny parts and hammer the merge process ("too many parts" errors).
- **UPDATE/DELETE are "mutations"** — `ALTER TABLE ... UPDATE/DELETE` — these are **asynchronous, heavyweight background operations** that rewrite whole parts. Not meant for frequent use.
- **Lightweight deletes** (`DELETE FROM table WHERE ...`, newer versions) mark rows for exclusion without full rewrite — faster than ALTER-based mutations but still not like OLTP deletes.
- Idiomatic patterns to avoid deletes/updates: `ReplacingMergeTree` (soft upsert), `CollapsingMergeTree` (soft update via cancel+insert rows), or partition-level `DROP PARTITION` for bulk deletion of old data.

---

## 10. Performance Tuning Talking Points

Be ready to discuss these as "things I'd check when a ClickHouse query is slow":

1. **Check ORDER BY / primary key alignment** — is the query's WHERE clause using a prefix of the sort key?
2. **Partition pruning** — is PARTITION BY aligned with common date-range filters?
3. **Too many parts** — caused by frequent small inserts; check `system.parts`; batch inserts instead.
4. **Use LowCardinality** for repetitive string columns.
4. **Avoid SELECT \*** — column storage means you pay per column touched.
5. **Use sampling** (`SAMPLE`) for approximate exploratory queries on huge tables.
6. **Materialized views for rollups** instead of re-aggregating raw data every query.
7. **Check `system.query_log`** for actual execution stats (rows read, memory, time).
8. **Distributed queries:** watch for a slow/uneven shard skewing overall latency, and check network cost of the final merge step on the coordinator.

---

## 11. Common System Tables (show you know how to introspect the DB)

- `system.parts` — part sizes, row counts, merge status per table.
- `system.query_log` — history of executed queries with performance metrics.
- `system.merges` — currently running background merges.
- `system.replicas` — replication lag/status.
- `system.mutations` — status of pending/running mutations.

---

## 12. Typical Interview Questions & Crisp Answers

**Q: Why is ClickHouse fast for analytics but bad for OLTP?**
A: Columnar storage + vectorized execution + high compression make full-column scans and aggregations extremely fast, but there's no row-level locking/transactions, and updates/deletes are heavyweight async mutations — the opposite of what OLTP needs (fast single-row read/write with strong consistency).

**Q: How would you deduplicate data in ClickHouse?**
A: `ReplacingMergeTree` with a version column, understanding dedup only happens at merge time; use `FINAL` for correctness-critical reads (with a performance cost) or `GROUP BY` + `argMax()` as a often-faster alternative.

**Q: How do you handle time-series data at scale?**
A: Partition by month/day (`PARTITION BY toYYYYMM(date)`), order by (metric/dimension, timestamp), use TTL to auto-expire old partitions, and build materialized views with AggregatingMergeTree for rollups (hourly/daily aggregates) so dashboards don't scan raw data.

**Q: What happens if you insert one row at a time repeatedly?**
A: Creates many tiny parts, causing merge pressure and "too many parts" errors; ClickHouse expects large batched inserts (thousands+ of rows).

**Q: Difference between sharding and replication?**
A: Sharding splits data across nodes for scale; replication copies the same data across nodes for fault tolerance/read availability. They're combined via ReplicatedMergeTree (per-shard replication) + Distributed table (cross-shard query routing).

**Q: When would you NOT use ClickHouse?**
A: When you need ACID transactions, frequent row-level updates/deletes, low-latency single-row lookups by primary key, or strong referential integrity — a traditional RDBMS or a key-value store fits better.

---

## 13. Quick-Reference Cheat Sheet

| Concept | One-liner |
|---|---|
| Storage model | Column-oriented |
| Core engine | MergeTree (immutable sorted parts, background merges) |
| Primary index | Sparse index over granules (default 8192 rows), not a B-tree |
| Sort key | `ORDER BY` — choose most selective/most-filtered columns first |
| Partitioning | `PARTITION BY` — usually by date, enables pruning + easy drops |
| Dedup/upsert | `ReplacingMergeTree` (+`FINAL` or `argMax` at query time) |
| Rollups | `SummingMergeTree` / `AggregatingMergeTree` + Materialized View |
| HA | ReplicatedMergeTree + Keeper |
| Scale-out | Distributed table engine across shards |
| Best insert pattern | Large batched inserts, not row-by-row |
| Updates/deletes | Async mutations — heavyweight, avoid frequent use |
| Compression boost | LowCardinality(String) for repetitive categorical data |

---

### Final tip for the interview
If asked an open-ended system design question ("design a real-time analytics pipeline with ClickHouse"), structure your answer around: **ingestion (batched inserts, maybe via Kafka engine) → raw MergeTree table → Materialized View → Aggregating/SummingMergeTree rollup table → Distributed table for cluster queries → TTL for retention.** This one flow demonstrates almost every core concept above.