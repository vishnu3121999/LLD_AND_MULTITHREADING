Below are **interview notes for ClickHouse**. Focus on these topics; this is enough for most HLD, backend, analytics, data infra, and database interviews.

---

# 1. What is ClickHouse?

ClickHouse is a **column-oriented OLAP database** used for fast analytical queries over large datasets. It is commonly used for:

* event analytics
* ad click analytics
* product analytics
* logs / metrics / traces
* dashboards
* real-time reporting
* fraud / anomaly analysis
* time-series aggregations
* TopK / heavy hitter queries

Simple interview line:

> ClickHouse is a real-time analytical database optimized for append-heavy workloads, columnar scans, compression, and aggregation queries over billions of rows.

It is **not** a replacement for PostgreSQL/MySQL for OLTP. Avoid it for:

* high-frequency row-level updates
* strict transactions across many rows/tables
* foreign keys / relational integrity
* point lookups by primary key
* frequent deletes
* user-facing transactional flows like orders, payments, balances

---

# 2. Core mental model

ClickHouse is fast because of this combination:

* **Columnar storage**: reads only required columns.
* **Compression**: similar column values compress very well.
* **Sparse primary index**: skips large ranges instead of indexing every row.
* **Sorted storage**: data is physically sorted by `ORDER BY`.
* **Vectorized execution**: processes blocks of column values efficiently.
* **Parallel execution**: uses many CPU cores and shards.
* **Pre-aggregation**: materialized views / projections / aggregate table engines.
* **Append-first design**: inserts are cheap when batched; updates/deletes are expensive.

The most important thing to remember:

> In ClickHouse, `ORDER BY` is more important than `PRIMARY KEY`.

In MergeTree tables, data is sorted by the sorting key. The primary key is sparse and is used for skipping data, not for enforcing uniqueness. ClickHouse explicitly says primary keys do **not** enforce uniqueness. ([ClickHouse][1])

---

# 3. ClickHouse vs PostgreSQL mental model

| Area         | PostgreSQL          | ClickHouse                         |
| ------------ | ------------------- | ---------------------------------- |
| Main use     | OLTP                | OLAP                               |
| Storage      | row-oriented        | column-oriented                    |
| Best for     | point reads/writes  | scans, filters, aggregations       |
| Primary key  | uniqueness + lookup | sparse index for skipping          |
| Updates      | normal              | expensive mutations                |
| Joins        | natural             | possible, but avoid large joins    |
| Transactions | strong OLTP         | limited analytical DB semantics    |
| Query type   | `get user by id`    | `count events by country per hour` |
| Schema style | normalized          | denormalized / wide tables         |

Interview one-liner:

> PostgreSQL optimizes for transactional correctness and row lookups. ClickHouse optimizes for scanning fewer columns, skipping data ranges, and aggregating huge event tables quickly.

---

# 4. MergeTree: the most important engine

Most ClickHouse production tables use the **MergeTree family**.

Example:

```sql
CREATE TABLE ad_events
(
    event_date Date,
    event_time DateTime,
    advertiser_id UInt64,
    campaign_id UInt64,
    ad_id UInt64,
    user_id UInt64,
    country LowCardinality(String),
    device LowCardinality(String),
    event_type Enum8('impression' = 1, 'click' = 2, 'conversion' = 3),
    cost Float64
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (advertiser_id, campaign_id, event_date, event_type, ad_id);
```

Important parts:

```sql
ENGINE = MergeTree
```

Base engine for large analytical tables.

```sql
PARTITION BY toYYYYMM(event_date)
```

Physically separates data into partitions, usually by time.

```sql
ORDER BY (...)
```

Defines physical sort order and drives data skipping.

```sql
PRIMARY KEY (...)
```

Optional. If not specified, ClickHouse usually uses `ORDER BY` as primary key.

---

# 5. Parts, partitions, granules, marks

This is the real internal architecture you should know.

When you insert data into a MergeTree table:

1. ClickHouse writes immutable **data parts**.
2. Parts belong to partitions.
3. Background merges combine smaller parts into bigger parts.
4. Parts are sorted by `ORDER BY`.
5. Each part is split into **granules**.
6. ClickHouse stores marks for granules.
7. During queries, it uses sparse indexes and marks to skip unnecessary granules.

Official docs say a granule is the smallest indivisible dataset ClickHouse reads during selection, and each data part has index marks for primary key values. ([ClickHouse][1])

Interview explanation:

> ClickHouse does not maintain a B-tree index for every row. It stores data sorted on disk and keeps sparse marks for ranges of rows. When a query filters by the leading columns of `ORDER BY`, ClickHouse can skip huge parts of the data.

---

# 6. Sparse primary index

Traditional DB index:

```text
one index entry per row
```

ClickHouse sparse index:

```text
one index entry per granule
```

That means:

* smaller index
* usually fits in memory
* very fast for range scans
* not good for exact random row lookup
* may read extra rows around matching granules

Official docs say sparse indexes allow very large row counts because such indexes usually fit in RAM. ([ClickHouse][1])

Example:

```sql
ORDER BY (tenant_id, event_date, event_type)
```

Good query:

```sql
WHERE tenant_id = 10
  AND event_date >= '2026-07-01'
  AND event_date < '2026-07-04'
```

Bad query:

```sql
WHERE event_type = 'click'
```

Why bad?

Because `event_type` is the third column in the sort key. If the query does not filter by leading columns like `tenant_id`, skipping becomes weaker.

---

# 7. How to choose `ORDER BY`

This is the most common interview question.

Choose columns based on:

1. Common filters
2. Low-cardinality columns first
3. Time column usually after tenant/customer/business key
4. Columns used in `GROUP BY`
5. Avoid very high-cardinality random columns first unless every query filters on them

Official docs recommend using fields commonly used in filters, choosing lower-cardinality columns first, and considering time-based components for timestamp datasets. ([ClickHouse][2])

Good for ad analytics:

```sql
ORDER BY (advertiser_id, campaign_id, event_date, event_type)
```

Good for product analytics:

```sql
ORDER BY (workspace_id, event_name, event_date, user_id)
```

Good for logs:

```sql
ORDER BY (service_name, log_date, level, timestamp)
```

Bad:

```sql
ORDER BY (uuid)
```

Why?

Random UUID gives poor locality and poor data skipping.

---

# 8. `PARTITION BY` rules

Partitioning is not the same as indexing.

Use partitioning for:

* data lifecycle management
* TTL/delete old data
* bulk drop by month/day
* limiting merge scope
* organizing time-series data

Common:

```sql
PARTITION BY toYYYYMM(event_date)
```

Avoid:

```sql
PARTITION BY user_id
```

Why?

Too many partitions create too many parts and too much metadata/merge overhead.

Official docs describe partitioning as logical segmentation via `PARTITION BY`, where each unique partition expression forms a physical partition on disk. ([ClickHouse][3])

Interview rule:

> Partition by low-cardinality time buckets, not by high-cardinality IDs.

---

# 9. Data types

Use smaller types because ClickHouse performance depends heavily on storage and compression.

Prefer:

```sql
UInt32 / UInt64
Date
DateTime
LowCardinality(String)
Enum8 / Enum16
Decimal
```

Avoid unnecessary:

```sql
String
Nullable
Float for money
```

Use `LowCardinality(String)` for repeated strings like:

* country
* device
* browser
* event_type
* status
* region

ClickHouse docs say `LowCardinality` uses dictionary coding and can improve `SELECT` performance for many applications. ([ClickHouse][4])

Example:

```sql
country LowCardinality(String),
device LowCardinality(String),
event_type LowCardinality(String)
```

---

# 10. Inserts

ClickHouse is append-optimized.

Bad:

```text
1 row per insert
```

Good:

```text
10k - 100k rows per insert
```

Official docs recommend inserting at least 1,000 rows per batch, ideally 10,000–100,000 rows, because fewer/larger inserts reduce part creation and merge load. ([ClickHouse][5])

Good ingestion path:

```text
App / Kafka / Flink / Spark
        ↓
Batch events
        ↓
Insert into ClickHouse
        ↓
MergeTree parts
        ↓
Background merges
```

For high concurrency small inserts, ClickHouse supports **asynchronous inserts**, where the server buffers incoming data and flushes it based on thresholds. ([ClickHouse][6])

Interview line:

> The bottleneck is not raw insert speed; the bottleneck is creating too many small parts. Batch inserts or async inserts prevent merge pressure.

---

# 11. Updates and deletes

ClickHouse supports updates/deletes, but they are not like PostgreSQL.

In ClickHouse, updates/deletes are usually implemented as **mutations**, which rewrite data parts in the background.

So:

* avoid frequent row updates
* avoid frequent deletes
* prefer append-only event model
* use versioned rows
* use ReplacingMergeTree for dedup/latest version patterns
* use TTL for old data deletion

Example event model:

```text
Do not update old row.
Insert a new event/version.
Resolve latest value during query or merge.
```

---

# 12. ReplacingMergeTree

Used for deduplication or latest-version rows.

Example:

```sql
CREATE TABLE user_profile_events
(
    user_id UInt64,
    version UInt64,
    name String,
    city String,
    updated_at DateTime
)
ENGINE = ReplacingMergeTree(version)
ORDER BY user_id;
```

Meaning:

* multiple rows for same `user_id` can exist
* during background merge, ClickHouse keeps latest version
* duplicates may still appear before merge
* use `FINAL` only carefully because it can be expensive

Interview line:

> ReplacingMergeTree gives eventual deduplication, not immediate uniqueness.

---

# 13. AggregatingMergeTree

Used for pre-aggregated rollups.

Example:

```sql
CREATE TABLE ad_event_rollup
(
    event_date Date,
    advertiser_id UInt64,
    campaign_id UInt64,
    impressions AggregateFunction(count),
    clicks AggregateFunction(count),
    spend AggregateFunction(sum, Float64)
)
ENGINE = AggregatingMergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (advertiser_id, campaign_id, event_date);
```

Usually fed by materialized views.

Use it when queries repeatedly do:

```sql
GROUP BY advertiser_id, campaign_id, date
```

---

# 14. Materialized views

Materialized views are extremely important for interviews.

Use them to shift compute from query time to insert time.

Official docs describe incremental materialized views as a way to move computation cost from `SELECT` time to `INSERT` time for faster queries. ([ClickHouse][7])

Example:

Raw table:

```sql
CREATE TABLE ad_events
(
    event_date Date,
    event_time DateTime,
    advertiser_id UInt64,
    campaign_id UInt64,
    event_type LowCardinality(String),
    cost Float64
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (advertiser_id, campaign_id, event_date, event_type);
```

Rollup table:

```sql
CREATE TABLE campaign_daily_stats
(
    event_date Date,
    advertiser_id UInt64,
    campaign_id UInt64,
    impressions UInt64,
    clicks UInt64,
    spend Float64
)
ENGINE = SummingMergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (advertiser_id, campaign_id, event_date);
```

Materialized view:

```sql
CREATE MATERIALIZED VIEW mv_campaign_daily_stats
TO campaign_daily_stats
AS
SELECT
    event_date,
    advertiser_id,
    campaign_id,
    countIf(event_type = 'impression') AS impressions,
    countIf(event_type = 'click') AS clicks,
    sum(cost) AS spend
FROM ad_events
GROUP BY
    event_date,
    advertiser_id,
    campaign_id;
```

Query:

```sql
SELECT *
FROM campaign_daily_stats
WHERE advertiser_id = 100
  AND event_date >= '2026-07-01'
  AND event_date < '2026-07-04';
```

Interview line:

> Use raw event tables for flexible investigation, and materialized views for dashboard-serving rollups.

---

# 15. Projections

Projections are like hidden optimized layouts inside the same table.

Use projections when:

* same table has multiple query patterns
* you need another sort order
* you want optimizer to choose automatically
* you do not want to manually query a separate materialized table

Materialized views vs projections:

| Feature              | Materialized View               | Projection                                         |
| -------------------- | ------------------------------- | -------------------------------------------------- |
| Storage              | separate target table           | stored inside same table                           |
| Querying             | query target table directly     | optimizer chooses automatically                    |
| Joins in definition  | yes, depending on MV type       | no                                                 |
| Multi-stage pipeline | yes                             | no                                                 |
| Operational control  | more                            | less                                               |
| Best for             | rollups / ETL / denormalization | alternative sort order / single-table acceleration |

Official docs say materialized views store results in an explicit target table, while projections create optimized layouts stored alongside the main table and are transparent to queries. ([ClickHouse][8])

---

# 16. Data skipping indexes

ClickHouse does not use secondary B-tree indexes like PostgreSQL.

It has **data skipping indexes**.

They store metadata per block/granule, like:

* min/max
* set of values
* bloom filter

They help skip blocks that cannot match the query.

Official docs say skip indexes store metadata about blocks, such as min/max values, value sets, or Bloom filters, and use that metadata to skip blocks during query execution. ([ClickHouse][9])

Example:

```sql
ALTER TABLE logs
ADD INDEX idx_trace_id trace_id TYPE bloom_filter(0.01) GRANULARITY 4;
```

Use when:

* column is not in primary key
* query often filters on that column
* data has some locality or skip potential

Do not blindly add indexes. First fix:

1. schema
2. data types
3. `ORDER BY`
4. materialized views
5. projections
6. then skipping indexes

Official docs also say skipping indexes should be considered after best practices like optimized types, good primary key, and materialized views. ([ClickHouse][9])

---

# 17. Distributed ClickHouse

Cluster concepts:

```text
Shard   = horizontal partition of data
Replica = copy of shard
```

Example:

```text
2 shards × 2 replicas = 4 nodes

Shard 1: replica A, replica B
Shard 2: replica A, replica B
```

* Sharding increases storage and query parallelism.
* Replication gives fault tolerance and more read throughput.
* Distributed table routes query to shards.
* ReplicatedMergeTree handles replicated local storage.

Official docs say replicas provide failover and can improve query throughput by allowing queries to run in parallel across replicas. ([ClickHouse][10])

Replication works at the table level, not the whole server level. ([ClickHouse][11])

Typical setup:

```text
Client
  ↓
Load Balancer
  ↓
ClickHouse Distributed Table
  ↓
Shard 1 local ReplicatedMergeTree
Shard 2 local ReplicatedMergeTree
Shard 3 local ReplicatedMergeTree
```

---

# 18. Distributed table

A `Distributed` table stores no data itself. It acts like a router.

Example:

```sql
CREATE TABLE ad_events_local
(
    event_date Date,
    event_time DateTime,
    advertiser_id UInt64,
    campaign_id UInt64,
    event_type LowCardinality(String)
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/ad_events_local', '{replica}')
PARTITION BY toYYYYMM(event_date)
ORDER BY (advertiser_id, campaign_id, event_date, event_type);
```

Distributed table:

```sql
CREATE TABLE ad_events_dist AS ad_events_local
ENGINE = Distributed(
    my_cluster,
    default,
    ad_events_local,
    cityHash64(advertiser_id)
);
```

Meaning:

```text
my_cluster       = cluster name
default          = database
ad_events_local  = local table on each shard
cityHash64(...)  = sharding key
```

Good sharding key:

```sql
cityHash64(tenant_id)
cityHash64(advertiser_id)
cityHash64(workspace_id)
```

Bad sharding key:

```sql
rand()
```

Why?

Random sharding distributes writes but makes tenant-specific queries hit all shards.

Interview rule:

> Choose sharding key based on query locality and data distribution. For multi-tenant analytics, shard by tenant/customer if queries are tenant-scoped.

---

# 19. ClickHouse Keeper / ZooKeeper

ClickHouse uses coordination for replication metadata.

Historically ZooKeeper was used. Modern deployments often use **ClickHouse Keeper**.

Used for:

* replicated table coordination
* leader election for merges
* replica metadata
* distributed DDL coordination

Important:

> Keeper does not store table data. It stores replication coordination metadata.

---

# 20. Joins

ClickHouse supports joins, but for low-latency analytics, avoid large runtime joins.

Official docs say ClickHouse supports many JOIN types/algorithms, but joins are more expensive than querying one denormalized table, and denormalization is strongly recommended for real-time or latency-sensitive analytical queries. ([ClickHouse][12])

Preferred approaches:

1. Denormalize at ingestion
2. Use dictionaries for key-value lookups
3. Use materialized views
4. Join small dimension tables
5. Avoid joining two huge fact tables

Example bad query:

```sql
SELECT ...
FROM huge_events e
JOIN huge_users u ON e.user_id = u.user_id;
```

Better:

```text
Enrich user country/device/plan during ingestion.
Store them directly in events table.
```

---

# 21. Dictionaries

Dictionaries are in-memory or external key-value lookup structures.

Use them for dimension enrichment:

```text
campaign_id → campaign_name
user_id → country
product_id → category
```

Official docs say dictionaries can speed up `LEFT ANY JOIN` where the join key matches the dictionary key. ([ClickHouse][13])

Interview line:

> Dictionaries are useful when the right side of a join is a key-value dimension lookup.

---

# 22. Query optimization checklist

When a ClickHouse query is slow, check this order:

1. Is query filtering by leading `ORDER BY` columns?
2. Is it scanning too many columns?
3. Is partition pruning happening?
4. Is primary key skipping effective?
5. Is the table over-partitioned?
6. Are there too many small parts?
7. Is a large join happening?
8. Can we denormalize?
9. Can we add materialized view rollup?
10. Can we use projection?
11. Can skipping index help?
12. Are data types too large?
13. Is `Nullable` unnecessary?
14. Is `FINAL` being used?
15. Is query memory spilling?

Useful commands:

```sql
EXPLAIN indexes = 1
SELECT ...
```

```sql
EXPLAIN PIPELINE
SELECT ...
```

```sql
SELECT *
FROM system.query_log
ORDER BY event_time DESC
LIMIT 10;
```

```sql
SELECT *
FROM system.parts
WHERE table = 'ad_events';
```

---

# 23. `PREWHERE`

`PREWHERE` is an optimization where ClickHouse filters using selective columns before reading all required columns.

Example:

```sql
SELECT user_id, url, payload
FROM events
PREWHERE event_date = today()
WHERE event_type = 'click';
```

Usually ClickHouse can move filters automatically to `PREWHERE`.

Interview line:

> PREWHERE reduces I/O for wide tables by reading filter columns first, then reading remaining columns only for matching rows.

---

# 24. `FINAL`

`FINAL` forces ClickHouse to apply final merge logic at query time.

Used with engines like:

* ReplacingMergeTree
* CollapsingMergeTree
* AggregatingMergeTree in some cases

But it can be expensive.

Bad:

```sql
SELECT *
FROM events FINAL
WHERE ...
```

Better:

* design dedup correctly
* query latest rows using version logic
* pre-aggregate
* wait for background merges
* avoid `FINAL` in high-QPS dashboards

Interview line:

> `FINAL` gives correct merged view but can destroy performance if used casually.

---

# 25. High-cardinality data

ClickHouse can handle high-cardinality columns, but you must design carefully.

Examples:

```text
user_id
request_id
trace_id
session_id
uuid
```

Rules:

* Do not put random high-cardinality UUID first in `ORDER BY`.
* Use high-cardinality column later in sort key if needed.
* Use bloom filter skip index for trace/request lookup.
* Use projections if access patterns conflict.
* For observability, sort by service/time first, not trace_id first, unless trace lookup is dominant.

Example logs table:

```sql
ORDER BY (service_name, log_date, level, timestamp)
```

Add bloom filter:

```sql
INDEX idx_trace_id trace_id TYPE bloom_filter(0.01) GRANULARITY 4
```

---

# 26. Common system design use case: Ad analytics

Raw event table:

```sql
CREATE TABLE ad_events
(
    event_date Date,
    event_time DateTime,
    advertiser_id UInt64,
    campaign_id UInt64,
    ad_id UInt64,
    user_id UInt64,
    country LowCardinality(String),
    device LowCardinality(String),
    event_type Enum8('impression' = 1, 'click' = 2, 'conversion' = 3),
    cost Decimal(18, 6)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (advertiser_id, campaign_id, event_date, event_type, ad_id);
```

Query patterns:

```sql
-- Daily campaign stats
SELECT
    event_date,
    campaign_id,
    countIf(event_type = 'impression') AS impressions,
    countIf(event_type = 'click') AS clicks,
    countIf(event_type = 'conversion') AS conversions,
    sum(cost) AS spend
FROM ad_events
WHERE advertiser_id = 123
  AND event_date >= '2026-07-01'
  AND event_date < '2026-07-04'
GROUP BY event_date, campaign_id;
```

CTR:

```sql
SELECT
    campaign_id,
    clicks / impressions AS ctr
FROM
(
    SELECT
        campaign_id,
        countIf(event_type = 'click') AS clicks,
        countIf(event_type = 'impression') AS impressions
    FROM ad_events
    WHERE advertiser_id = 123
    GROUP BY campaign_id
);
```

TopK ads:

```sql
SELECT
    ad_id,
    count() AS clicks
FROM ad_events
WHERE advertiser_id = 123
  AND event_type = 'click'
  AND event_date = today()
GROUP BY ad_id
ORDER BY clicks DESC
LIMIT 100;
```

---

# 27. Common architecture for ClickHouse in HLD

```text
Client Apps
   ↓
Kafka / Kinesis / PubSub
   ↓
Stream Processor
   - validation
   - dedup
   - enrichment
   - batching
   ↓
ClickHouse raw_events
   ↓
Materialized Views
   ↓
Rollup Tables
   ↓
Dashboard API
   ↓
Frontend
```

Production pattern:

```text
Raw table        = flexible debugging / ad hoc analysis
Rollup table     = fast dashboard queries
Materialized view = automatic aggregation pipeline
Distributed table = query across shards
Replicas         = HA + read scale
```

---

# 28. When to use ClickHouse in interview

Use ClickHouse when the problem says:

* analytics
* dashboards
* aggregation
* filtering over huge event data
* top-k
* logs
* metrics
* time-series analysis
* real-time reporting
* high ingest + low-latency analytical reads

Examples:

* Google Ads analytics
* YouTube analytics
* Instagram impressions analytics
* payment metrics dashboard
* API monitoring dashboard
* ad click aggregator
* feature usage analytics
* fraud analytics
* search analytics
* notification delivery analytics

Do not use ClickHouse as primary DB for:

* URL mappings in URL shortener
* user profiles
* wallet balances
* orders table
* booking inventory
* chat messages primary store
* document editing state

But you can use it for analytics around those systems.

Example:

```text
URL shortener:
Postgres / DynamoDB → short URL mapping
ClickHouse → click analytics
```

---

# 29. ClickHouse vs BigQuery

| Area          | ClickHouse                                 | BigQuery                             |
| ------------- | ------------------------------------------ | ------------------------------------ |
| Type          | real-time OLAP DB                          | serverless cloud data warehouse      |
| Best for      | low-latency dashboards, high-QPS analytics | ad hoc large-scale warehouse queries |
| Ops           | self-managed or cloud                      | mostly serverless                    |
| Latency       | usually lower for serving analytics        | usually higher but scalable          |
| Cost model    | infra/storage/compute controlled by you    | pay-per-scan/slots                   |
| Ingestion     | real-time inserts common                   | batch/streaming supported            |
| Query serving | good for user-facing analytics             | good for internal analytics / BI     |
| Schema design | very important                             | also important but more forgiving    |
| Interview use | real-time analytics store                  | data warehouse / ad hoc analytics    |

Simple line:

> Use ClickHouse when the product needs sub-second or low-second analytical queries at high QPS. Use BigQuery when the company wants serverless warehouse-style ad hoc analytics over huge datasets.

---

# 30. ClickHouse vs Elasticsearch

| Area             | ClickHouse                  | Elasticsearch                              |
| ---------------- | --------------------------- | ------------------------------------------ |
| Main use         | analytics / aggregations    | search / text search                       |
| Best query       | `GROUP BY`, filters, TopK   | inverted-index text search                 |
| Storage          | columnar                    | document/inverted index                    |
| Logs             | good for analytical logs    | good for search-heavy logs                 |
| Full-text search | not primary strength        | core strength                              |
| Cost at scale    | often cheaper for analytics | can be expensive for high-cardinality logs |

Simple line:

> Use Elasticsearch when text search is primary. Use ClickHouse when aggregation over events/logs is primary.

---

# 31. ClickHouse vs Druid / Pinot

| Area       | ClickHouse                     | Druid / Pinot                           |
| ---------- | ------------------------------ | --------------------------------------- |
| Main use   | general OLAP analytics         | real-time OLAP serving                  |
| SQL        | strong SQL support             | SQL supported                           |
| Storage    | MergeTree columnar engine      | segment-based OLAP engines              |
| Ops        | simpler single binary feel     | more distributed components             |
| Use cases  | broad analytics, logs, metrics | dashboards, user-facing analytics       |
| Interviews | easier to explain deeply       | common in large-scale analytics systems |

Simple line:

> Pinot/Druid are also real-time OLAP systems, but ClickHouse is often simpler to reason about in interviews because MergeTree, ORDER BY, partitions, and materialized views explain most of the system.

---

# 32. Interview questions and ideal answers

## Q1. Why is ClickHouse fast?

Because it combines columnar storage, compression, sparse primary indexes, sorted data, vectorized execution, parallelism, and pre-aggregation.

---

## Q2. Why is ClickHouse bad for OLTP?

Because it is optimized for large scans and append-heavy writes, not frequent single-row updates, constraints, transactions, and point lookups.

---

## Q3. What is the difference between `PRIMARY KEY` and `ORDER BY`?

`ORDER BY` defines physical sort order. `PRIMARY KEY` defines sparse index expression. In many tables they are same, but primary key does not enforce uniqueness.

---

## Q4. How do you choose `ORDER BY`?

Use columns that appear in common filters, put lower-cardinality columns first, include time, and align with query access patterns.

---

## Q5. How do you choose `PARTITION BY`?

Usually partition by month/day using date. Use it for retention and partition pruning. Do not partition by high-cardinality IDs.

---

## Q6. Why are small inserts bad?

Each insert creates parts. Too many small parts increase merge pressure and degrade performance. Use batch inserts or async inserts.

---

## Q7. What are materialized views used for?

To precompute aggregates or transformed data at insert time, reducing query-time computation.

---

## Q8. What are projections?

Alternative physical layouts stored with the table. They help optimize different query patterns transparently.

---

## Q9. How does sharding work?

Data is split across shards using a sharding key. Distributed tables route queries to shards. Each shard computes partial result, then results are merged.

---

## Q10. How does replication work?

ReplicatedMergeTree replicates table data across replicas. Coordination is handled by ClickHouse Keeper/ZooKeeper. Replication is per table.

---

## Q11. How to optimize slow query?

Check `ORDER BY`, partition pruning, scanned columns, primary key usage, joins, parts count, materialized views, projections, skipping indexes, and `FINAL`.

---

## Q12. How to support dashboard over billions of events?

Use raw MergeTree event table, materialized views into rollup tables, good sort key, time partitioning, distributed cluster, and cache/API layer.

---

# 33. Minimum SQL you should know

Create table:

```sql
CREATE TABLE events
(
    event_date Date,
    event_time DateTime,
    tenant_id UInt64,
    event_name LowCardinality(String),
    user_id UInt64,
    properties String
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (tenant_id, event_name, event_date, user_id);
```

Insert:

```sql
INSERT INTO events VALUES
('2026-07-04', now(), 1, 'click', 1001, '{}');
```

Aggregation:

```sql
SELECT
    event_date,
    event_name,
    count() AS cnt
FROM events
WHERE tenant_id = 1
  AND event_date >= '2026-07-01'
GROUP BY event_date, event_name
ORDER BY event_date;
```

TopK:

```sql
SELECT
    event_name,
    count() AS cnt
FROM events
WHERE tenant_id = 1
GROUP BY event_name
ORDER BY cnt DESC
LIMIT 10;
```

Approx distinct:

```sql
SELECT uniq(user_id)
FROM events
WHERE event_date = today();
```

Conditional count:

```sql
SELECT
    countIf(event_name = 'click') AS clicks,
    countIf(event_name = 'view') AS views
FROM events;
```

Materialized view:

```sql
CREATE MATERIALIZED VIEW mv_daily_events
TO daily_events
AS
SELECT
    event_date,
    tenant_id,
    event_name,
    count() AS cnt
FROM events
GROUP BY event_date, tenant_id, event_name;
```

---

# 34. What you should memorize

Memorize these lines:

1. **ClickHouse is for OLAP, not OLTP.**
2. **`ORDER BY` is the most important schema decision.**
3. **Primary key does not enforce uniqueness.**
4. **ClickHouse uses sparse primary indexes over granules.**
5. **Batch inserts are critical.**
6. **Avoid frequent updates/deletes.**
7. **Use materialized views for rollups.**
8. **Use projections for alternative sort layouts.**
9. **Use denormalization instead of large joins.**
10. **Shard for scale, replicate for HA.**
11. **Partition by time buckets, not high-cardinality IDs.**
12. **Use ClickHouse for real-time analytics dashboards.**

---

# 35. Learning order

Learn in this order:

1. OLAP vs OLTP
2. Columnar storage
3. MergeTree
4. Parts, partitions, granules
5. `ORDER BY` and sparse primary index
6. Insert batching
7. Materialized views
8. Distributed tables
9. Replication
10. Projections
11. Data skipping indexes
12. Query optimization
13. Real system design examples: ad analytics, metrics monitoring, URL shortener analytics, notification analytics

That is enough for interviews.

[1]: https://clickhouse.com/docs/engines/table-engines/mergetree-family/mergetree "MergeTree table engine | ClickHouse Docs"
[2]: https://clickhouse.com/docs/optimize/query-optimization "A simple guide for query optimization | ClickHouse Docs"
[3]: https://clickhouse.com/docs/optimize/partitioning-key?utm_source=chatgpt.com "Choose a low cardinality partitioning key"
[4]: https://clickhouse.com/docs/sql-reference/data-types/lowcardinality?utm_source=chatgpt.com "LowCardinality(T) | ClickHouse Docs"
[5]: https://clickhouse.com/docs/optimize/bulk-inserts?utm_source=chatgpt.com "Bulk inserts | ClickHouse Docs"
[6]: https://clickhouse.com/docs/optimize/asynchronous-inserts?utm_source=chatgpt.com "Asynchronous inserts (async_insert) | ClickHouse Docs"
[7]: https://clickhouse.com/docs/materialized-views "Materialized views | ClickHouse Docs"
[8]: https://clickhouse.com/docs/managing-data/materialized-views-versus-projections "Materialized views versus projections | ClickHouse Docs"
[9]: https://clickhouse.com/docs/best-practices/use-data-skipping-indices-where-appropriate "Use data skipping indices where appropriate | ClickHouse Docs"
[10]: https://clickhouse.com/docs/shards "Table shards and replicas | ClickHouse Docs"
[11]: https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication "Replicated* table engines | ClickHouse Docs"
[12]: https://clickhouse.com/docs/best-practices/minimize-optimize-joins?utm_source=chatgpt.com "Minimize and optimize JOINs | ClickHouse Docs"
[13]: https://clickhouse.com/docs/dictionary?utm_source=chatgpt.com "Dictionary | ClickHouse Docs"
