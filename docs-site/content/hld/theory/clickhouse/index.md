---
title: ClickHouse
slug: clickhouse
summary: Interview-focused guide to ClickHouse architecture, MergeTree storage, schema design, sparse indexes, ingestion, materialized views, replication, sharding, query optimization, and capacity planning.
tags:
  - database
  - olap
  - analytics
  - distributed-systems
  - clickhouse
difficulty: intermediate
---

# ClickHouse

ClickHouse is a distributed, column-oriented SQL database designed for fast analytical queries over large volumes of data.

It is commonly used for:

- Product and application analytics.
- Ad-click and impression analytics.
- Observability: logs, metrics and traces.
- Real-time dashboards.
- Time-series analytics.
- Security-event analytics.
- Customer-facing analytics.
- Data warehousing.
- Aggregation over billions or trillions of rows.
- Top-K, funnel and cohort analysis.
- Querying data shortly after ingestion.

> **One-line interview definition:** ClickHouse is a column-oriented OLAP database that stores data in immutable, sorted parts and uses sparse indexes, compression, vectorized execution, parallelism and background merges to answer large analytical queries quickly.

ClickHouse is optimized for:

```text
scan many rows
read only required columns
filter aggressively
aggregate in parallel
return a comparatively small result
```

It is not primarily optimized for:

```text
fetch one row
update it in place
commit a multi-row transaction
enforce relational constraints
```

<!-- IMAGE PLACEHOLDER
Title: ClickHouse at a glance
What to use: A high-level diagram showing applications, Kafka, CDC and object storage feeding ClickHouse, followed by dashboards, APIs and analysts querying it.
Preferred source: ClickHouse official homepage, architecture overview and use-case documentation.
Search terms: site:clickhouse.com/docs ClickHouse architecture real-time analytics diagram
Purpose: Introduce ClickHouse as the analytical serving layer between producers and consumers.
Alt text: Applications, event streams and databases ingest data into ClickHouse, which serves dashboards, APIs and analytical users.
Editorial note: Verify the image licence before publishing. Prefer an official ClickHouse image. If no suitable reusable image exists, create an original Excalidraw diagram from the official documentation.
-->

# 1. Why ClickHouse Exists

Traditional row-oriented databases store all columns of a row together.

```text
Row 1: timestamp, user_id, country, device, revenue
Row 2: timestamp, user_id, country, device, revenue
Row 3: timestamp, user_id, country, device, revenue
```

This works well for transactional workloads that read or update complete rows.

Analytical queries usually read:

- A few columns.
- From millions or billions of rows.
- With filters.
- Followed by aggregation.

Example:

```sql
SELECT
    country,
    sum(revenue)
FROM events
WHERE event_time >= now() - INTERVAL 7 DAY
GROUP BY country;
```

The query only needs:

```text
event_time
country
revenue
```

ClickHouse stores each column separately and compresses similar values together. It reads only the required columns and processes them in large batches.

## 2. OLTP vs OLAP

### OLTP

Online Transaction Processing systems handle:

- Point reads.
- Small writes.
- Frequent updates.
- Short transactions.
- Constraints.
- Joins across normalized entities.

Examples:

- Create an order.
- Reserve inventory.
- Update account status.
- Fetch a user by primary key.

Typical databases:

```text
PostgreSQL
MySQL
SQL Server
Oracle
```

### OLAP

Online Analytical Processing systems handle:

- Large scans.
- Aggregations.
- Time-range filters.
- Group-by.
- Top-K.
- Funnels.
- Cohort analysis.
- Large append-heavy datasets.

Examples:

- Revenue by country for the last 30 days.
- Top 100 ads by clicks in the last hour.
- Error count by service and deployment.
- Daily active users.
- Conversion funnel by campaign.

ClickHouse is primarily an OLAP database.

<!-- IMAGE PLACEHOLDER
Title: OLTP vs OLAP query shapes
What to use: A comparison diagram where OLTP performs point reads and row updates while OLAP scans many rows, reads a few columns and produces aggregates.
Preferred source: Create an original diagram based on ClickHouse official overview and database fundamentals.
Search terms: ClickHouse OLTP OLAP comparison official
Purpose: Prevent readers from choosing ClickHouse for transactional workloads.
Alt text: OLTP accesses a few complete rows while OLAP scans many rows and aggregates selected columns.
Editorial note: Prefer an original diagram because this comparison should match the website's visual style.
-->

## 3. Why Columnar Storage Helps

Suppose a table has 100 columns and a query uses 4 columns.

A row store may read complete rows or pages containing many unnecessary fields. A column store can read only the 4 required columns.

Benefits:

- Less disk I/O.
- Better compression.
- Better CPU-cache locality.
- Vectorized processing over values of one type.
- Efficient aggregation.

Columnar storage is most effective when queries return aggregated or narrow results rather than complete wide rows.

<!-- IMAGE PLACEHOLDER
Title: Row-oriented vs column-oriented storage
What to use: Side-by-side storage layouts showing full rows stored together versus individual columns stored together. Highlight a query reading only three columns.
Preferred source: ClickHouse official architecture or academic overview.
Search terms: site:clickhouse.com/docs ClickHouse column oriented storage diagram
Purpose: Explain why analytical queries read less data in ClickHouse.
Alt text: A row store reads full rows while ClickHouse reads only the columns required by the analytical query.
Editorial note: Recreate the concept if the official visual is too detailed.
-->

# When to Use ClickHouse

## 4. Good Use Cases

ClickHouse is a good fit when most of the following are true:

- Queries scan large numbers of rows.
- Queries select only a subset of columns.
- Aggregation is common.
- Data is append-heavy.
- New data must be queryable within seconds or less.
- Query patterns include time ranges, dimensions and metrics.
- The dataset is too large for one transactional database.
- Low-latency dashboards must query fresh data.
- Data can be denormalized.
- Updates and deletes are less common than inserts.
- Horizontal analytical scaling is required.

Typical use cases:

- Ad impressions and clicks.
- Website events.
- API and application logs.
- Metrics and traces.
- E-commerce analytics.
- Fraud-event exploration.
- Network telemetry.
- Gaming and IoT analytics.
- Customer-facing reports.

## 5. When Not to Use ClickHouse

Avoid ClickHouse as the primary database when the workload mainly requires:

- High-volume single-row updates.
- Multi-row ACID transactions.
- Foreign-key enforcement.
- Unique constraints.
- Frequent point lookups by arbitrary identifiers.
- Complex transactional workflows.
- A normalized application domain model.
- Strict serializable consistency.
- Distributed locks or queue semantics.

| Requirement | Better starting choice |
|---|---|
| Order creation and inventory transaction | PostgreSQL |
| User session cache | Redis |
| Durable event stream and replay | Kafka |
| Full-text search | Elasticsearch or OpenSearch |
| Key-based high-write event serving | Cassandra |
| Ad-hoc analytical aggregation | ClickHouse |
| Financial ledger | Transactional relational database |
| Object storage | S3, GCS or equivalent |

<!-- IMAGE PLACEHOLDER
Title: ClickHouse database-selection decision
What to use: A flowchart beginning with query shape: transactions and point updates go to OLTP; large scans and aggregations go to ClickHouse.
Preferred source: Create an original diagram based on ClickHouse best practices.
Search terms: ClickHouse when to use OLAP best practices
Purpose: Give interview candidates a quick database-selection framework.
Alt text: ClickHouse is chosen for large analytical scans, while transactional databases are chosen for row-level transactions.
Editorial note: Keep this diagram compact enough to appear near the beginning of the page.
-->

## 6. ClickHouse in a Data Architecture

A common architecture is:

```text
Applications / Kafka / CDC / Object Storage
                    |
                    v
                ClickHouse
                    |
          +---------+---------+
          |         |         |
          v         v         v
      Dashboard    API      Analyst
```

Unlike a traditional warehouse refreshed only in large batches, ClickHouse is often used when fresh data must be queryable quickly.

### Possible source-of-truth models

#### ClickHouse is the analytical source of truth

```text
producer -> ClickHouse
```

Requires replication, backups, idempotent retries and restore testing.

#### Kafka is the durable event source

```text
producer -> Kafka -> ClickHouse
```

Advantages:

- Replay.
- Decoupled ingestion.
- Rebuilding tables.
- Multiple consumers.

#### Object storage is the long-term source

```text
producer -> object storage
         -> ClickHouse hot analytical serving
```

Useful when ClickHouse retains only the hot period.

<!-- IMAGE PLACEHOLDER
Title: ClickHouse in a modern data architecture
What to use: Producers, operational databases, Kafka and object storage feeding ClickHouse, with dashboards, APIs and analysts reading from it.
Preferred source: ClickHouse integrations and architecture documentation.
Search terms: site:clickhouse.com/docs integrations Kafka CDC S3 architecture ClickHouse
Purpose: Show the common place of ClickHouse in an HLD architecture.
Alt text: Operational systems and streams feed ClickHouse, which serves real-time analytical consumers.
Editorial note: Use arrows to distinguish streaming ingestion, batch backfill and query traffic.
-->

# Architecture

## 7. Core Components

A self-managed ClickHouse deployment can contain:

- **ClickHouse server:** Stores data and executes queries.
- **Shard:** Holds a subset of table rows.
- **Replica:** Holds another copy of one shard.
- **Distributed table:** Routes queries across shards.
- **Local table:** Physically stores data on a server.
- **ClickHouse Keeper:** Coordinates replicated table metadata and replica logs.
- **Client or HTTP/native interface:** Sends SQL queries and inserts.
- **Background pools:** Perform merges, mutations, fetches and maintenance.

## 8. Single-Node Deployment

A single ClickHouse server can be sufficient when:

- The dataset fits on one machine.
- One server provides enough CPU and I/O.
- Temporary unavailability is acceptable.
- Development simplicity is valuable.

It does not provide node-level high availability or horizontal storage scaling.

<!-- IMAGE PLACEHOLDER
Title: Single-node ClickHouse architecture
What to use: A ClickHouse server showing client interfaces, query execution, memory, background tasks and MergeTree storage.
Preferred source: ClickHouse official architecture overview.
Search terms: site:clickhouse.com/docs ClickHouse single server architecture
Purpose: Explain ClickHouse before sharding and replication are introduced.
Alt text: A single ClickHouse server executes SQL, stores MergeTree parts and runs background merges.
Editorial note: Separate foreground query/insert paths from background merge work.
-->

## 9. Shards and Replicas

A shard contains part of the dataset. A replica stores another copy of the same shard.

Example:

```text
2 shards × 2 replicas = 4 data nodes
```

```text
Shard 1:
  Replica 1A
  Replica 1B

Shard 2:
  Replica 2A
  Replica 2B
```

Sharding increases:

- Storage capacity.
- Insert throughput.
- Query CPU and I/O.

Replication increases:

- Availability.
- Data redundancy.
- Read capacity in selected configurations.

<!-- IMAGE PLACEHOLDER
Title: Two shards with two replicas
What to use: A cluster diagram showing two independent shards, each with two replicas, plus a ClickHouse Keeper ensemble.
Preferred source: ClickHouse official architecture overview, shards documentation or cluster deployment guide.
Search terms: site:clickhouse.com/docs ClickHouse two shards two replicas diagram
Purpose: Clarify the difference between sharding and replication.
Alt text: A ClickHouse cluster has two data shards and two replicas for each shard.
Editorial note: Use consistent node labels such as S1R1, S1R2, S2R1 and S2R2.
-->

## 10. Distributed Query Coordinator

A distributed query is received by one server. That server:

1. Parses and plans the query.
2. Identifies relevant shards.
3. Sends subqueries to shard replicas.
4. Each shard filters and performs partial aggregation.
5. The coordinator receives intermediate results.
6. It merges, sorts or aggregates the final result.
7. It returns the answer.

Push as much work as possible to shards to reduce network transfer.

<!-- IMAGE PLACEHOLDER
Title: Distributed query execution
What to use: A coordinator sending subqueries to multiple shards, shards scanning and partially aggregating, and the coordinator merging final results.
Preferred source: ClickHouse academic architecture overview and query-parallelism documentation.
Search terms: site:clickhouse.com/docs ClickHouse distributed query execution diagram
Purpose: Show how distributed analytics reduces central data movement.
Alt text: ClickHouse shards perform local filtering and aggregation before the coordinator combines results.
Editorial note: Annotate rows sent back before and after partial aggregation to show network savings.
-->

# Data Model

## 11. Logical and Physical Terms

- **Database:** Namespace for tables and objects.
- **Table:** Schema and table engine.
- **Column:** Typed values stored independently.
- **Row:** Logical record reconstructed from columns.
- **Part:** Immutable set of rows written to disk.
- **Partition:** Logical grouping of parts for lifecycle operations.
- **Granule:** Smallest common range read through MergeTree indexes.
- **Mark:** Metadata used to seek to granules in column files.

## 12. Table Engine

A table engine defines:

- How data is stored.
- Whether data is replicated.
- How parts are merged.
- Whether duplicates are replaced or aggregated.
- Whether the table stores data or routes to another table.

```sql
CREATE TABLE events
(
    event_time DateTime,
    user_id UInt64,
    country LowCardinality(String),
    event_type LowCardinality(String),
    revenue Decimal(18, 2)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_time)
ORDER BY (event_type, event_time, user_id);
```

## 13. Schema-on-Write and Denormalization

ClickHouse tables use explicit types.

Benefits:

- Efficient binary representation.
- Better compression.
- Faster execution.
- Predictable memory use.

Do not store every event as one opaque JSON string unless the query treats it as opaque.

Prefer:

```text
frequently filtered fields -> typed columns
frequently aggregated fields -> typed columns
rare flexible attributes -> Map, JSON or raw payload where appropriate
```

ClickHouse often uses wide denormalized tables because repeated dimension values compress well and query-time joins can be avoided.

<!-- IMAGE PLACEHOLDER
Title: ClickHouse logical and physical data model
What to use: A hierarchy showing database → table → partition → immutable parts → granules → separate column files.
Preferred source: ClickHouse MergeTree and academic overview documentation.
Search terms: site:clickhouse.com/docs partition data part granule ClickHouse diagram
Purpose: Connect SQL concepts to MergeTree physical storage.
Alt text: A ClickHouse table contains partitions, each partition contains parts, and parts contain granules stored by column.
Editorial note: Use nested boxes and avoid showing sharding in this diagram.
-->

<!-- IMAGE PLACEHOLDER
Title: Denormalized analytical event table
What to use: A wide event table containing dimensions and measures, contrasted with normalized tables that require joins.
Preferred source: Create an original diagram from ClickHouse schema-design and JOIN best practices.
Search terms: site:clickhouse.com/docs ClickHouse denormalization joins best practices
Purpose: Explain why analytical schemas often duplicate dimensions.
Alt text: A denormalized ClickHouse event table stores dimensions and measures together to avoid repeated query-time joins.
Editorial note: Include one example query that becomes a single-table scan.
-->

# MergeTree Storage

## 14. Why MergeTree Matters

The MergeTree family provides:

- Columnar storage.
- Sorted data.
- Sparse primary indexes.
- Partition pruning.
- Data skipping indexes.
- Compression.
- Immutable parts.
- Background merging.
- Replication variants.
- TTL and mutations.
- Specialized replacement and aggregation semantics.

## 15. Insert Creates a Part

A synchronous insert block is sorted according to `ORDER BY` and written as a new immutable data part.

```text
INSERT block
    |
    v
sort by ORDER BY
    |
    v
write compressed column files
    |
    v
new immutable part
```

Frequent tiny inserts create many tiny parts.

## 16. Data Part

A part:

- Belongs to one partition.
- Is sorted by `ORDER BY`.
- Stores each column separately.
- Has index and mark metadata.
- Is immutable after creation.

Updates normally create new parts, patch parts or mutation results rather than overwriting arbitrary bytes in place.

## 17. Column Files

Conceptually, a part can contain:

```text
event_time.bin
country.bin
device_type.bin
revenue.bin
```

A query selecting `country` and `revenue` does not need to read a large payload column.

## 18. Granules and Marks

A granule is the smallest common row range normally selected through the MergeTree index.

A common default index granularity is approximately:

```text
8,192 rows
```

Adaptive granularity can also be bounded by byte size.

The primary index stores entries at granule boundaries, not one entry per row. Marks identify locations in compressed column data so ClickHouse can seek to selected granules.

## 19. Background Merges

As inserts continue:

```text
Part A + Part B -> Part AB
Part C + Part D -> Part CD
Part AB + Part CD -> Part ABCD
```

Merges occur within a partition. Old parts are removed after the merged part becomes active.

<!-- IMAGE PLACEHOLDER
Title: MergeTree insert path
What to use: An insert block being sorted by ORDER BY, compressed by column and written as a new immutable part.
Preferred source: ClickHouse MergeTree and insert-strategy documentation.
Search terms: site:clickhouse.com/docs ClickHouse insert data part MergeTree diagram
Purpose: Explain why batch size directly affects part count.
Alt text: A ClickHouse insert is sorted, compressed and written as a new immutable MergeTree part.
Editorial note: Show acknowledgement after the part is created, with replication covered in a separate diagram.
-->

<!-- IMAGE PLACEHOLDER
Title: Inside a MergeTree data part
What to use: A cutaway diagram showing compressed files per column, marks, primary index and metadata.
Preferred source: ClickHouse sparse-primary-index guide and MergeTree documentation.
Search terms: site:clickhouse.com/docs ClickHouse data part column files marks primary index
Purpose: Visualize the storage structures used by a query.
Alt text: A MergeTree part contains compressed column files plus marks and sparse-index metadata.
Editorial note: Label files conceptually rather than reproducing internal filenames exactly.
-->

<!-- IMAGE PLACEHOLDER
Title: Rows, granules and index marks
What to use: Rows sorted by ORDER BY, divided into granules, with one index entry at every granule boundary.
Preferred source: ClickHouse practical introduction to sparse primary indexes.
Search terms: site:clickhouse.com/docs sparse primary index granule marks ClickHouse
Purpose: Make the sparse index intuitive.
Alt text: Sorted rows are divided into granules and the primary index stores one entry per granule rather than per row.
Editorial note: Use a small example with 24 rows and 4 granules.
-->

<!-- IMAGE PLACEHOLDER
Title: Background part merges
What to use: Several small immutable parts progressively merged into fewer larger parts without crossing partition boundaries.
Preferred source: ClickHouse part-merges documentation.
Search terms: site:clickhouse.com/docs ClickHouse part merges diagram
Purpose: Explain why MergeTree requires continuous background I/O.
Alt text: ClickHouse combines small immutable parts into larger parts in the background within each partition.
Editorial note: Use arrows that show old parts becoming inactive after the new part is complete.
-->

# ORDER BY, Primary Key and Partitioning

## 20. `ORDER BY` Is the Most Important Schema Choice

In MergeTree tables, `ORDER BY` determines:

- Physical row order within each part.
- Sparse primary-index usefulness.
- Compression locality.
- Which queries read narrow ranges.
- Replacement or aggregation identity in specialized engines.

```sql
ORDER BY (tenant_id, event_type, event_time)
```

Rows are sorted lexicographically by tenant, event type and time.

## 21. Primary Keys Are Not Unique

In ClickHouse:

```text
PRIMARY KEY != relational uniqueness constraint
```

Multiple rows can have identical primary-key values.

If only `ORDER BY` is specified, the primary key normally defaults to the sorting key.

## 22. Primary Key vs Sorting Key

ClickHouse can define:

```sql
PRIMARY KEY (tenant_id, event_type)
ORDER BY (tenant_id, event_type, event_time, event_id)
```

Rules:

- The primary key must be a prefix of the sorting key.
- The primary index is based on the primary key.
- Full physical order is based on `ORDER BY`.
- A shorter primary key uses less index memory.
- Additional sort columns can improve compression and merge semantics.

## 23. Prefix Behavior

Given:

```sql
ORDER BY (tenant_id, country, event_type, event_time)
```

Strong filters include:

```sql
WHERE tenant_id = ?
```

```sql
WHERE tenant_id = ?
  AND country = ?
```

```sql
WHERE tenant_id = ?
  AND country = ?
  AND event_type = ?
  AND event_time >= ?
```

A query filtering only by `event_time` can run, but the sparse primary index may not eliminate much data.

## 24. Choosing Key Order

A useful heuristic:

1. Put commonly filtered dimensions first.
2. Prefer columns that remove large parts of the dataset.
3. Preserve locality for time ranges.
4. Consider low-cardinality dimensions before timestamp.
5. Consider compression.
6. Consider engine-specific deduplication identity.
7. Avoid an almost unique identifier first unless point lookup dominates.

Example for multi-tenant events:

```sql
ORDER BY (tenant_id, event_type, event_time)
```

## 25. Partitioning Key

`PARTITION BY` groups parts for:

- Coarse pruning.
- TTL and lifecycle.
- Dropping old data.
- Moving, attaching or detaching partitions.
- Operational maintenance.

```sql
PARTITION BY toYYYYMM(event_time)
```

Partitioning is not sharding:

```text
partition -> local lifecycle grouping
shard -> distribution across servers
```

## 26. Partition Granularity

Common choices:

```text
monthly
daily
weekly
tenant + month in selected cases
```

Too coarse:

- Large lifecycle units.
- Less partition pruning.

Too fine:

- Too many partitions and parts.
- More metadata.
- Fragmented merges.

Do not partition by high-cardinality values such as user ID or request ID without a strong reason.

## 27. Partitioning Is Not the Main Index

For most filtering performance:

```text
ORDER BY and sparse primary index
```

matter more than partitioning. Use partitions mainly for coarse pruning and lifecycle management.

<!-- IMAGE PLACEHOLDER
Title: ORDER BY physical row layout
What to use: Rows sorted lexicographically by a compound sorting key, with a query selecting a narrow contiguous range.
Preferred source: ClickHouse choosing-a-primary-key and sparse-index documentation.
Search terms: site:clickhouse.com/docs ClickHouse ORDER BY physical sort primary key diagram
Purpose: Show why key-column order changes query performance.
Alt text: Rows are physically ordered by the ClickHouse sorting key, allowing prefix filters to read narrow ranges.
Editorial note: Include a poor filter on the last key column for comparison.
-->

<!-- IMAGE PLACEHOLDER
Title: Sparse-index binary search
What to use: A sparse primary-index array with marks and a binary search selecting relevant granules.
Preferred source: ClickHouse practical introduction to sparse primary indexes.
Search terms: site:clickhouse.com/docs ClickHouse sparse primary index binary search diagram
Purpose: Explain how a small in-memory index prunes large data ranges.
Alt text: ClickHouse searches sparse primary-key marks to identify granules that may contain matching rows.
Editorial note: Keep row and mark values aligned visually.
-->

<!-- IMAGE PLACEHOLDER
Title: Primary key vs sorting key
What to use: PRIMARY KEY shown as a prefix of ORDER BY, with index entries based on the primary key and row order based on the full tuple.
Preferred source: ClickHouse MergeTree documentation.
Search terms: site:clickhouse.com/docs ClickHouse primary key differs sorting key
Purpose: Remove relational-database misconceptions.
Alt text: The primary key controls sparse-index entries while ORDER BY controls full physical row order.
Editorial note: Show that duplicates are allowed.
-->

<!-- IMAGE PLACEHOLDER
Title: Partitioning vs sorting vs sharding
What to use: Three panels showing partitioning grouping parts, sorting ordering rows inside parts and sharding distributing rows across nodes.
Preferred source: ClickHouse partitioning-key, MergeTree and shard documentation.
Search terms: site:clickhouse.com/docs ClickHouse partitioning sorting sharding
Purpose: Prevent three commonly confused concepts from being mixed.
Alt text: Partitions manage local lifecycle, sorting controls in-part order and shards distribute data between servers.
Editorial note: Use distinct symbols and labels for each concept.
-->

<!-- IMAGE PLACEHOLDER
Title: Monthly partition pruning
What to use: Several monthly partitions, a July query skipping all other months, followed by sparse-index pruning inside July parts.
Preferred source: ClickHouse partitioning and primary-index documentation.
Search terms: site:clickhouse.com/docs ClickHouse partition pruning primary index
Purpose: Show the two-stage pruning process.
Alt text: ClickHouse first skips unrelated partitions and then uses the sparse index inside selected parts.
Editorial note: Include rows/bytes avoided at both stages.
-->

# Data Parts and Merge Pressure

## 28. Why Batch Inserts Matter

Every insert can create a part.

Bad ingestion:

```text
1 row per INSERT
10,000 INSERTs per second
```

Better:

```text
batch thousands or tens of thousands of rows
```

The correct batch depends on row width, insert rate and latency requirements.

A practical interview starting point is:

```text
at least 1,000 rows per insert
prefer 10,000–100,000 rows when latency allows
```

These are starting assumptions, not product limits.

## 29. Too Many Parts

Symptoms:

- Insert latency rises.
- `Too many parts` errors.
- Merge backlog grows.
- Queries inspect many files.
- Metadata overhead grows.

Root causes:

- Tiny inserts.
- Too many partitions touched by each batch.
- Slow disks.
- Excessive materialized-view fan-out.
- Heavy mutations.
- Underprovisioned background pools.

## 30. Merge Work

Merges:

- Read compressed parts.
- Decompress and combine rows.
- Apply engine-specific semantics.
- Recompress.
- Write a new part.
- Remove old parts later.

They consume CPU, disk bandwidth and temporary space.

## 31. Large Parts and Merge Limits

ClickHouse does not necessarily merge until one part remains. Very large parts may stop being selected for ordinary merges because rewriting them is expensive.

This matters for merge-time deduplication and aggregation.

## 32. `OPTIMIZE FINAL`

`OPTIMIZE TABLE ... FINAL` forces merging and can rewrite large volumes.

Do not use it as:

- Routine query logic.
- A scheduled fix for tiny inserts.
- A substitute for correct ReplacingMergeTree queries.
- A normal production maintenance command on huge tables.

<!-- IMAGE PLACEHOLDER
Title: Tiny inserts vs batch inserts
What to use: Single-row inserts producing thousands of tiny parts versus batched inserts producing a few healthy parts.
Preferred source: ClickHouse bulk-insert and insert-strategy documentation.
Search terms: site:clickhouse.com/docs ClickHouse bulk inserts too many parts
Purpose: Explain why client batching is essential.
Alt text: Single-row inserts create many small parts while batched inserts create fewer efficient parts.
Editorial note: Include the same number of rows on both sides.
-->

<!-- IMAGE PLACEHOLDER
Title: Too-many-parts failure cycle
What to use: Tiny inserts → too many parts → merge backlog → insert delays or rejection → retries → more pressure.
Preferred source: Create an original diagram from ClickHouse MergeTree settings and insert documentation.
Search terms: ClickHouse too many parts merge backlog
Purpose: Show the operational feedback loop caused by poor batching.
Alt text: Tiny inserts overwhelm background merges and eventually cause ClickHouse insert delays or failures.
Editorial note: Mark the retry storm as an application-level amplifier.
-->

<!-- IMAGE PLACEHOLDER
Title: Merge write amplification
What to use: Raw inserted bytes repeatedly rewritten through small-to-medium-to-large part merges.
Preferred source: ClickHouse part-merges documentation.
Search terms: site:clickhouse.com/docs ClickHouse merge amplification parts
Purpose: Make hidden background I/O visible for capacity planning.
Alt text: Inserted data is repeatedly read and rewritten as ClickHouse merges parts into larger parts.
Editorial note: Label the diagram as conceptual; actual merge selection varies.
-->

# Data Types and Compression

## 33. Choose the Smallest Correct Type

Prefer:

```text
UInt8 instead of UInt64 for a small bounded value
Date instead of String for a date
DateTime64 for sub-second time
Decimal for exact fixed-point money
UUID for UUIDs
IPv4/IPv6 for addresses
LowCardinality(String) for repeated dimensions
```

Smaller types improve storage, memory, CPU cache use and scan speed.

## 34. `LowCardinality`

Good candidates:

```text
country
device_type
status
event_type
service_name
```

It dictionary-encodes repeated values, often reducing storage and speeding grouping/comparison.

Do not apply it blindly to almost-unique strings.

## 35. `Nullable`

Nullable columns require null-state representation and may reduce compression or performance.

Use them when `NULL` has real business meaning. Otherwise prefer a non-nullable type with a meaningful default.

## 36. Strings and Semi-Structured Data

Large raw strings are expensive to scan. Promote frequently filtered properties to typed columns.

Example:

```text
raw attributes Map(String, String)
+
country LowCardinality(String)
+
device_type LowCardinality(String)
```

Use arrays, maps, tuples and JSON for flexible attributes, not as an excuse to avoid schema design.

## 37. Compression Codecs

Common codecs include:

- LZ4.
- ZSTD.
- Delta.
- DoubleDelta.
- Gorilla.
- T64.

Example:

```sql
event_time DateTime64(3) CODEC(Delta, ZSTD),
value Float64 CODEC(Gorilla, ZSTD)
```

Start with defaults, then benchmark representative data.

## 38. Sorting Improves Compression

Similar adjacent values compress better.

```sql
ORDER BY (tenant_id, country, event_type, event_time)
```

can group repeated dimensions into long runs.

The sorting key is therefore both:

```text
query-access design
and
compression design
```

<!-- IMAGE PLACEHOLDER
Title: ClickHouse type-size comparison
What to use: Generic String/UInt64 columns compared with Date, Enum, LowCardinality and smaller integers, showing memory and scan reduction.
Preferred source: ClickHouse data-type best practices.
Search terms: site:clickhouse.com/docs ClickHouse select data types best practices
Purpose: Encourage schema sizing rather than using generic types.
Alt text: Domain-specific ClickHouse types reduce storage, memory and scan cost.
Editorial note: Use relative bars rather than universal byte claims.
-->

<!-- IMAGE PLACEHOLDER
Title: LowCardinality dictionary encoding
What to use: Repeated country or status strings replaced by compact IDs referencing a dictionary.
Preferred source: ClickHouse LowCardinality documentation.
Search terms: site:clickhouse.com/docs ClickHouse LowCardinality diagram
Purpose: Explain why repeated dimensions become compact.
Alt text: LowCardinality stores repeated strings as compact dictionary identifiers.
Editorial note: Show the same logical values before and after encoding.
-->

<!-- IMAGE PLACEHOLDER
Title: Sorting improves compression
What to use: Randomly interleaved categorical values compared with sorted repeated runs and smaller compressed blocks.
Preferred source: ClickHouse primary-key and compression documentation.
Search terms: site:clickhouse.com/docs ClickHouse sorting compression ratio
Purpose: Show the secondary benefit of ORDER BY.
Alt text: Sorting similar values together produces repeated runs that compress more efficiently.
Editorial note: Avoid claiming one fixed compression ratio.
-->

# MergeTree Family

## 39. `MergeTree`

Use plain `MergeTree` for append-only analytical data where no special merge-time replacement or aggregation is required.

## 40. `ReplacingMergeTree`

`ReplacingMergeTree` stores multiple versions initially and removes older versions with the same sorting key during background merges.

```sql
ENGINE = ReplacingMergeTree(version)
ORDER BY (order_id)
```

```text
order_id=1, status=CREATED, version=1
order_id=1, status=PAID,    version=2
```

Until a merge, both versions may physically exist.

Important:

- Deduplication is eventual.
- Merge timing is not guaranteed.
- `ORDER BY` defines duplicate identity.
- `FINAL` can deduplicate during SELECT.
- `FINAL` adds query cost.

## 41. `SummingMergeTree`

It sums numeric columns for rows with the same sorting key during merges.

Use for additive pre-aggregates such as:

```text
campaign_id, hour, impressions, clicks
```

Queries may still need `sum(...) GROUP BY` because merging is asynchronous.

## 42. `AggregatingMergeTree`

Stores aggregate-function states such as:

```text
AggregateFunction(sum, UInt64)
AggregateFunction(uniq, UInt64)
AggregateFunction(quantiles, Float64)
```

Materialized views write partial states; queries use `...Merge` functions to combine and finalize them.

## 43. Collapsing Engines

`CollapsingMergeTree` uses a sign column to cancel older states. `VersionedCollapsingMergeTree` adds versions to handle out-of-order events more safely.

They are powerful but harder to reason about. Prefer simpler append or replacing models when possible.

## 44. Replicated Variants

Most MergeTree-family engines have replicated equivalents:

```text
ReplicatedMergeTree
ReplicatedReplacingMergeTree
ReplicatedSummingMergeTree
ReplicatedAggregatingMergeTree
```

Replication changes availability and data-copy behavior; merge semantics remain engine-specific.

<!-- IMAGE PLACEHOLDER
Title: MergeTree-family decision tree
What to use: A decision tree selecting MergeTree, ReplacingMergeTree, SummingMergeTree, AggregatingMergeTree or collapsing engines.
Preferred source: ClickHouse MergeTree-family documentation.
Search terms: site:clickhouse.com/docs ClickHouse MergeTree family engines
Purpose: Help candidates choose an engine deliberately.
Alt text: Different MergeTree engines support append-only, replacement, summing, aggregate-state and collapsing models.
Editorial note: Keep Replicated variants as a separate replication layer rather than separate branches.
-->

<!-- IMAGE PLACEHOLDER
Title: ReplacingMergeTree version lifecycle
What to use: Two row versions inserted into separate parts, both visible before a merge, with the older version removed later.
Preferred source: ClickHouse ReplacingMergeTree guide.
Search terms: site:clickhouse.com/docs ReplacingMergeTree versions merge FINAL diagram
Purpose: Explain eventual deduplication.
Alt text: ReplacingMergeTree temporarily stores multiple versions and removes older versions during background merges.
Editorial note: Add a query-time FINAL path alongside the background merge path.
-->

<!-- IMAGE PLACEHOLDER
Title: SummingMergeTree merge
What to use: Multiple additive rows with the same sorting key combined into a summed row during a merge.
Preferred source: ClickHouse SummingMergeTree documentation.
Search terms: site:clickhouse.com/docs SummingMergeTree merge diagram
Purpose: Show that aggregation happens during merges rather than at acknowledgement time.
Alt text: SummingMergeTree combines additive metric rows with the same sorting key during background merges.
Editorial note: Include a SELECT that still performs sum across unmerged rows.
-->

<!-- IMAGE PLACEHOLDER
Title: AggregatingMergeTree states
What to use: Raw events transformed into aggregate states, states merged in storage and finalized during SELECT.
Preferred source: ClickHouse AggregatingMergeTree and materialized-view documentation.
Search terms: site:clickhouse.com/docs AggregatingMergeTree aggregate states diagram
Purpose: Explain state, merge and finalize stages.
Alt text: ClickHouse stores partial aggregate states and merges them before producing final values.
Editorial note: Use sumState/sumMerge and uniqState/uniqMerge examples.
-->

# Ingestion

## 45. Synchronous Inserts

A synchronous insert normally:

1. Sends a block of rows.
2. Parses and validates data.
3. Sorts by `ORDER BY`.
4. Builds compressed column files.
5. Writes a part.
6. Replicates according to engine and settings.
7. Returns acknowledgement.

A timeout is ambiguous: the insert may have succeeded.

## 46. Bulk Inserts

Prefer larger blocks.

Common starting guidance:

```text
1,000+ rows minimum
10,000–100,000 rows when latency allows
```

Benefits:

- Fewer parts.
- Better compression.
- Less per-insert overhead.
- Higher throughput.

## 47. Asynchronous Inserts

Async inserts allow small client inserts to be buffered and flushed as larger parts.

Useful when producers cannot batch.

Trade-offs:

- Buffering delay.
- Memory use.
- Acknowledgement semantics depend on settings.
- Deduplication requires care.
- Distinct insert shapes can create separate buffers.

## 48. Insert Deduplication

Replicated MergeTree tables can remember recently inserted blocks to suppress duplicate retries.

For deterministic retries:

- Retry the same block.
- Preserve row order and values.
- Use an explicit deduplication token when appropriate.
- Understand the finite deduplication window.

This is not a permanent global unique constraint.

## 49. Kafka Ingestion

Canonical flow:

```text
Producer
   |
   v
Kafka topic
   |
   v
Kafka-engine table
   |
   v
Materialized view
   |
   v
MergeTree target table
```

Design for:

- Consumer count and Kafka partitions.
- Parsing failures.
- Schema evolution.
- Retry and duplicates.
- Dead-letter handling.
- Backpressure.
- Catch-up after outage.

## 50. External Kafka Consumer

An external consumer can batch and insert into ClickHouse.

Advantages:

- Full retry control.
- Custom transformation.
- Dead-letter logic.
- Shared ingestion framework.

Trade-off: more application and offset-coordination complexity.

## 51. CDC

```text
PostgreSQL/MySQL
      |
      v
WAL/binlog connector
      |
      v
ClickHouse ReplacingMergeTree
```

Challenges:

- Initial snapshot.
- Update/delete representation.
- Ordering.
- Duplicate delivery.
- Schema changes.
- Sorting-key choice.
- Query-time deduplication.

## 52. Object Storage and Backfill

ClickHouse can read Parquet and other files from object storage for historical backfill.

Use `INSERT SELECT` for:

- Backfills.
- Schema migrations.
- Repartitioning.
- Building derived tables.
- Reprocessing archived data.

Throttle large backfills so they do not overwhelm merges and foreground queries.

<!-- IMAGE PLACEHOLDER
Title: Synchronous insert lifecycle
What to use: Client block → parse → sort → compress → write part → replicate → acknowledge.
Preferred source: ClickHouse insert-strategy and MergeTree documentation.
Search terms: site:clickhouse.com/docs ClickHouse synchronous insert lifecycle
Purpose: Show what occurs before an insert returns.
Alt text: ClickHouse parses, sorts, compresses and writes an insert block as a data part before acknowledgement.
Editorial note: Separate local part creation from replica acknowledgement.
-->

<!-- IMAGE PLACEHOLDER
Title: Asynchronous insert buffering
What to use: Many small client inserts entering server-side buffers and being flushed as one larger part.
Preferred source: ClickHouse asynchronous-insert documentation.
Search terms: site:clickhouse.com/docs ClickHouse asynchronous inserts diagram
Purpose: Explain how async inserts reduce tiny parts.
Alt text: ClickHouse buffers many small inserts and flushes them as larger efficient parts.
Editorial note: Show the configurable waiting/flush boundary.
-->

<!-- IMAGE PLACEHOLDER
Title: Insert retry deduplication
What to use: A client times out, retries the same block and ClickHouse suppresses it using the recent deduplication window.
Preferred source: ClickHouse deduplicating-inserts-on-retries guide.
Search terms: site:clickhouse.com/docs ClickHouse insert deduplication retry diagram
Purpose: Clarify ambiguous insert failures and bounded deduplication.
Alt text: ClickHouse recognizes a recently inserted block and avoids storing a duplicate after a retry.
Editorial note: Label the window as finite.
-->

<!-- IMAGE PLACEHOLDER
Title: Kafka-engine ingestion
What to use: Kafka partitions consumed by a Kafka table, transformed through a materialized view and persisted to MergeTree.
Preferred source: ClickHouse Kafka integration documentation.
Search terms: site:clickhouse.com/docs ClickHouse Kafka engine materialized view diagram
Purpose: Show the canonical Kafka ingestion path.
Alt text: Kafka messages flow through a ClickHouse Kafka-engine table and materialized view into a persistent MergeTree table.
Editorial note: Include consumer groups and offsets.
-->

<!-- IMAGE PLACEHOLDER
Title: CDC upsert pipeline
What to use: PostgreSQL/MySQL change log → CDC connector → versioned ClickHouse rows with version and deleted fields.
Preferred source: ClickHouse CDC and ReplacingMergeTree documentation.
Search terms: site:clickhouse.com/docs ClickHouse CDC ReplacingMergeTree diagram
Purpose: Explain how transactional updates become immutable analytical versions.
Alt text: Database changes are streamed into ClickHouse as versioned rows and deduplicated through ReplacingMergeTree.
Editorial note: Show insert, update and delete events separately.
-->

<!-- IMAGE PLACEHOLDER
Title: Historical backfill
What to use: Parquet files in object storage read through an INSERT SELECT into a new ClickHouse table while live ingestion continues.
Preferred source: ClickHouse S3 and insert-select documentation.
Search terms: site:clickhouse.com/docs ClickHouse S3 backfill INSERT SELECT
Purpose: Show a safe replay and migration path.
Alt text: Historical files are loaded from object storage into ClickHouse while a boundary separates live data.
Editorial note: Mark the overlap/deduplication boundary.
-->

# Query Execution

## 53. Vectorized Execution

ClickHouse processes values in blocks rather than interpreting one row at a time.

Operations such as filtering, summing, comparison, hashing and grouping run on arrays of typed values.

Benefits:

- Better CPU-cache locality.
- Lower function-call overhead.
- SIMD opportunities.
- Efficient decompression.
- High throughput per core.

## 54. Parallel Query Processing

A query can use:

- Multiple CPU threads.
- Multiple parts.
- Multiple shards.
- Parallel aggregation.
- Parallel storage reads.

Trade-off:

```text
one query faster
vs
more concurrent queries
```

## 55. Query Pipeline

Conceptually:

```text
partition pruning
  -> primary-index pruning
  -> skip-index pruning
  -> PREWHERE
  -> read remaining columns
  -> WHERE
  -> aggregation
  -> merge partial results
  -> sort / limit
  -> return
```

## 56. Column Pruning

Avoid:

```sql
SELECT *
```

Read only columns needed by selection, filters, grouping, sorting and joins.

## 57. `PREWHERE`

`PREWHERE` reads selective filter columns first and reads larger remaining columns only for surviving row ranges.

```sql
SELECT user_id, message
FROM logs
PREWHERE service = 'payments'
  AND level = 'ERROR'
WHERE timestamp >= now() - INTERVAL 1 HOUR;
```

ClickHouse can move eligible `WHERE` predicates into PREWHERE automatically.

## 58. Data Skipping Indexes

Types include:

- `minmax`.
- `set`.
- Bloom-filter-based indexes.
- Token Bloom filters.
- N-gram Bloom filters.

They store block-level summaries and skip blocks that cannot match. They do not replace a good sorting key.

## 59. `minmax`

Useful when values are correlated with row order, such as time or monotonic numeric values.

Poor for random UUIDs.

## 60. `set`

Useful when each indexed block contains few distinct values. It becomes ineffective when values are highly diverse.

## 61. Bloom Filters

They answer:

```text
definitely absent
or
possibly present
```

Trade-offs:

- Extra storage.
- Insert/merge CPU.
- False positives.
- Tuning complexity.

## 62. Sampling

A sampling key enables deterministic approximate queries over a subset.

Use for exploratory analysis, not billing or compliance.

## 63. `LIMIT`

`LIMIT` does not guarantee a cheap query. ClickHouse may still need to scan, aggregate or globally sort before applying the limit.

<!-- IMAGE PLACEHOLDER
Title: Vectorized query execution
What to use: Rows transformed into column blocks, with one operator applied to a vector instead of one row at a time.
Preferred source: ClickHouse academic architecture overview.
Search terms: site:clickhouse.com/docs ClickHouse vectorized execution diagram
Purpose: Explain CPU efficiency.
Alt text: ClickHouse processes batches of column values using vectorized operators.
Editorial note: Show one filter and one sum operation.
-->

<!-- IMAGE PLACEHOLDER
Title: ClickHouse query pipeline
What to use: A full pipeline from partition pruning through primary index, skip indexes, PREWHERE, column reads, aggregation and final merge.
Preferred source: ClickHouse query-optimization and academic-overview documentation.
Search terms: site:clickhouse.com/docs ClickHouse query pipeline pruning aggregation
Purpose: Provide one reusable mental model for query execution.
Alt text: ClickHouse progressively removes irrelevant data before reading selected columns and aggregating results.
Editorial note: Annotate rows and bytes remaining after each stage.
-->

<!-- IMAGE PLACEHOLDER
Title: PREWHERE vs WHERE
What to use: A wide table where PREWHERE reads two small filter columns first and reads a large message column only for matches.
Preferred source: ClickHouse PREWHERE documentation.
Search terms: site:clickhouse.com/docs ClickHouse PREWHERE diagram
Purpose: Show why PREWHERE reduces I/O on wide tables.
Alt text: PREWHERE filters using small columns before ClickHouse reads large result columns.
Editorial note: Use a rejected-row mask between the two reads.
-->

<!-- IMAGE PLACEHOLDER
Title: Data-skipping index types
What to use: Minmax, set and Bloom-filter summaries over granules, each skipping blocks that cannot match.
Preferred source: ClickHouse skipping-index documentation and examples.
Search terms: site:clickhouse.com/docs ClickHouse minmax set bloom filter skipping index
Purpose: Explain block-level secondary indexing.
Alt text: ClickHouse skip indexes store summaries that eliminate granules guaranteed not to match.
Editorial note: Show one suitable and one unsuitable data distribution for each type.
-->

<!-- IMAGE PLACEHOLDER
Title: Query parallelism
What to use: One query split across threads and shards, producing partial aggregates that are merged into a final result.
Preferred source: ClickHouse query-parallelism documentation.
Search terms: site:clickhouse.com/docs ClickHouse query parallelism diagram
Purpose: Show why one analytical query can consume many cores.
Alt text: ClickHouse scans and aggregates in parallel across threads and shards before merging partial results.
Editorial note: Contrast latency-optimized and concurrency-optimized thread settings.
-->

# Query Optimization

## 64. Start with Rows and Bytes Read

For a slow query, inspect:

- Rows read.
- Bytes read.
- Selected parts and granules.
- Duration.
- Peak memory.
- Threads.
- Network transfer.
- Temporary disk spill.

The first question is usually:

```text
Why did this query read so much data?
```

## 65. Use `EXPLAIN`

```sql
EXPLAIN indexes = 1
SELECT ...;
```

```sql
EXPLAIN PIPELINE
SELECT ...;
```

Use it to understand index pruning, query stages, concurrency, joins and distributed execution.

## 66. Filter Early and Select Narrowly

- Select only needed columns.
- Filter on partition and sorting-key columns.
- Filter before large joins.
- Filter before high-cardinality grouping.
- Avoid unnecessary global sorts.

## 67. Group-By Cardinality

Grouping by a nearly unique field creates a large hash table.

```text
memory
≈ number of groups × aggregate-state size
```

## 68. Approximate Aggregates

ClickHouse provides approximate algorithms for distinct counts, quantiles and Top-K.

Use approximate functions when small error is acceptable and exact state is too expensive. Use exact functions for billing, compliance and correctness-critical results.

## 69. Spill to Disk

Selected aggregations, sorts and joins can spill to disk when configured.

Spill avoids OOM but is slower. Provision temporary disk and set limits deliberately.

## 70. Query Concurrency

One query may use many cores. At high concurrency:

- CPU becomes oversubscribed.
- Memory rises.
- I/O queues grow.
- Tail latency increases.

Control per-user limits, maximum threads, memory, queues and timeouts.

<!-- IMAGE PLACEHOLDER
Title: Query-optimization workflow
What to use: Inspect bytes read → verify partition pruning → verify primary index → inspect skip indexes → reduce columns, groups and joins.
Preferred source: ClickHouse query-optimization guide.
Search terms: site:clickhouse.com/docs ClickHouse query optimization workflow
Purpose: Give candidates a systematic tuning process.
Alt text: ClickHouse optimization begins by reducing bytes read before tuning aggregation, joins and concurrency.
Editorial note: Use a numbered diagnostic flow rather than a generic performance pyramid.
-->

<!-- IMAGE PLACEHOLDER
Title: High-cardinality GROUP BY memory
What to use: Increasing group cardinality producing a larger aggregation hash table and eventual disk spill.
Preferred source: Create an original diagram from ClickHouse aggregation and memory documentation.
Search terms: ClickHouse high cardinality group by memory spill
Purpose: Explain why result dimensionality matters.
Alt text: A GROUP BY with more unique combinations requires a larger aggregation table and may spill to disk.
Editorial note: Show exact distinct request IDs as the extreme case.
-->

# Materialized Views and Pre-Aggregation

## 71. Incremental Materialized View

An incremental materialized view acts like an insert trigger:

```text
insert into source
      |
      v
materialized-view SELECT
      |
      v
insert into target
```

It processes newly inserted blocks instead of rescanning the source.

Use for:

- Pre-aggregation.
- Transformation.
- Filtering.
- Routing.
- Building query-specific tables.

## 72. Hourly Aggregate Example

```sql
CREATE TABLE hourly_campaign_metrics
(
    hour DateTime,
    campaign_id UInt64,
    impressions UInt64,
    clicks UInt64,
    spend Decimal(18, 2)
)
ENGINE = SummingMergeTree
PARTITION BY toYYYYMM(hour)
ORDER BY (campaign_id, hour);
```

```sql
CREATE MATERIALIZED VIEW hourly_campaign_metrics_mv
TO hourly_campaign_metrics
AS
SELECT
    toStartOfHour(event_time) AS hour,
    campaign_id,
    countIf(event_type = 'IMPRESSION') AS impressions,
    countIf(event_type = 'CLICK') AS clicks,
    sum(spend) AS spend
FROM ad_events
GROUP BY hour, campaign_id;
```

## 73. Insert-Block Semantics

An incremental view processes the inserted block. It does not automatically recompute historical rows when:

- A source row is mutated.
- A dimension changes.
- A new view is created.
- Old partitions are attached through a separate path.

Historical backfill must be planned.

## 74. Fan-Out Cost

One insert can trigger several materialized views.

Each view adds:

- CPU.
- Memory.
- Part creation.
- Merge work.
- Failure paths.

## 75. Aggregate States

For non-additive metrics, store aggregate states in `AggregatingMergeTree`:

```text
uniqState(user_id)
quantilesState(0.5, 0.95, 0.99)(latency)
```

Queries use `uniqMerge`, `quantilesMerge` and related functions.

## 76. Refreshable Materialized Views

Refreshable materialized views periodically rerun a complete query.

Use when:

- Complete recomputation is acceptable.
- Source rows change.
- Complex joins must reflect updated dimensions.
- Snapshot-style output is required.

```text
incremental MV -> processes new blocks
refreshable MV -> reruns a query on a schedule
```

## 77. Cascading Views

```text
raw events
 -> minute aggregates
 -> hourly aggregates
 -> daily aggregates
```

The downstream view receives rows inserted into the intermediate target, not necessarily its final merged state.

## 78. Safe Backfill

1. Create the target table.
2. Create the view with a boundary for new data.
3. Backfill older data with `INSERT SELECT`.
4. Validate overlap and duplicates.
5. Complete the cutover.

<!-- IMAGE PLACEHOLDER
Title: Incremental materialized-view flow
What to use: Source insert block transformed by a materialized view and inserted into a smaller target table.
Preferred source: ClickHouse materialized-view documentation.
Search terms: site:clickhouse.com/docs ClickHouse incremental materialized view diagram
Purpose: Explain moving computation from query time to insert time.
Alt text: An incremental materialized view transforms each new source block into rows for a target table.
Editorial note: Show that existing source rows are not automatically processed.
-->

<!-- IMAGE PLACEHOLDER
Title: Raw-to-hourly aggregation
What to use: Thousands of raw ad events summarized into one row per campaign and hour.
Preferred source: ClickHouse materialized-view best practices.
Search terms: site:clickhouse.com/docs ClickHouse materialized view pre aggregation diagram
Purpose: Show why pre-aggregation changes query cost.
Alt text: A ClickHouse materialized view converts many raw events into compact hourly campaign metrics.
Editorial note: Add approximate rows and bytes before and after.
-->

<!-- IMAGE PLACEHOLDER
Title: Incremental vs refreshable materialized views
What to use: Side-by-side comparison of continuous block processing and scheduled full-query recomputation.
Preferred source: ClickHouse materialized-view documentation.
Search terms: site:clickhouse.com/docs ClickHouse incremental refreshable materialized view
Purpose: Clarify two features with similar names.
Alt text: Incremental views process new inserts while refreshable views periodically recompute query results.
Editorial note: Include freshness, cost and source-change behavior.
-->

<!-- IMAGE PLACEHOLDER
Title: Cascading materialized views
What to use: Raw → minute → hourly → daily aggregate tables with insert-trigger arrows.
Preferred source: ClickHouse cascading-materialized-views guide.
Search terms: site:clickhouse.com/docs ClickHouse cascading materialized views diagram
Purpose: Demonstrate multi-resolution rollups.
Alt text: ClickHouse materialized views cascade raw events into minute, hourly and daily aggregate tables.
Editorial note: Label each target engine.
-->

<!-- IMAGE PLACEHOLDER
Title: Materialized-view backfill
What to use: A time boundary separating historical INSERT SELECT backfill from live inserts processed by the new materialized view.
Preferred source: ClickHouse materialized-view and backfill guidance.
Search terms: site:clickhouse.com/docs ClickHouse materialized view backfill
Purpose: Prevent gaps and double counting during deployment.
Alt text: Historical data is backfilled while new events flow through the materialized view after a defined boundary.
Editorial note: Highlight the overlap risk.
-->

# Projections

## 79. What a Projection Is

A projection stores an alternative representation inside the table.

It can provide:

- Another sorting order.
- Pre-aggregated layout.
- A cheaper query path.

The optimizer can select it automatically.

## 80. Projection vs Materialized View

| Projection | Materialized view |
|---|---|
| Inside the same table | Separate target table |
| Optimizer can select automatically | Query normally targets the derived table |
| Good for alternate order or aggregation | More flexible transformation and lifecycle |
| Maintained with table parts | Independent engine and settings |

## 81. Alternate Access Pattern

Base table:

```sql
ORDER BY (tenant_id, event_time)
```

Frequent secondary query:

```text
lookup by trace_id
```

A projection can store an alternate order by trace ID.

Trade-offs:

- Extra storage.
- Extra insert and merge work.
- Mutation complexity.
- More monitoring.

<!-- IMAGE PLACEHOLDER
Title: Base table with alternate projection
What to use: A base part sorted by tenant/time and a projection sorted by trace ID, with the optimizer choosing between them.
Preferred source: ClickHouse projection documentation.
Search terms: site:clickhouse.com/docs ClickHouse projections alternate sorting key diagram
Purpose: Show how one table can support two access paths.
Alt text: ClickHouse stores a base layout and an alternate projection so the optimizer can choose the cheaper scan.
Editorial note: Use the same logical rows in both layouts.
-->

<!-- IMAGE PLACEHOLDER
Title: Projection vs materialized view
What to use: A projection inside one table compared with a materialized view writing to an independent target table.
Preferred source: ClickHouse projection and materialized-view documentation.
Search terms: site:clickhouse.com/docs ClickHouse projection versus materialized view
Purpose: Help choose the correct precomputation mechanism.
Alt text: Projections are alternate representations within a table, while materialized views populate separate tables.
Editorial note: Include optimizer selection and independent retention as differentiators.
-->

# Joins, Dictionaries and Denormalization

## 82. JOIN Support

ClickHouse supports joins, but large joins can dominate memory, CPU, network and latency.

Analytical joins are not forbidden. They must be deliberate.

## 83. Denormalize Frequent Dimensions

If every query joins events to campaign metadata, consider storing campaign attributes in event rows.

Advantages:

- No repeated join.
- Better query latency.
- Historical attribute value can be preserved.

Trade-offs:

- Duplicate storage.
- Dimension changes do not rewrite old events.
- Ingestion can use stale dimension data.

## 84. Dictionaries

Dictionaries provide key-value lookup data.

Use for:

- Country code to name.
- Campaign metadata.
- User segment.
- IP range enrichment.
- Small changing dimensions.

Trade-offs:

- Refresh delay.
- Memory.
- Source availability.
- Current-value semantics rather than historical-value semantics.

## 85. Join Algorithms

Conceptual options include:

- Hash join.
- Parallel hash join.
- Grace hash join.
- Sort-merge variants.
- Direct join.

Interview approach:

1. Filter both sides early.
2. Keep the build side small where relevant.
3. Pre-aggregate before joining.
4. Consider denormalization or dictionary.
5. Set memory and spill limits.
6. Benchmark actual cardinality.

## 86. Distributed Joins

Cross-shard joins can cause broadcast, shuffle and query multiplication.

Co-locate related rows where possible:

```text
shard by tenant_id
```

## 87. Historical vs Current Dimension

Choose explicitly:

```text
event-time dimension -> store attribute in the event
current dimension    -> dictionary lookup at query time
```

<!-- IMAGE PLACEHOLDER
Title: Denormalization vs query-time join
What to use: Wide event rows queried directly versus normalized facts joined with a dimension table for every query.
Preferred source: ClickHouse JOIN and denormalization best practices.
Search terms: site:clickhouse.com/docs ClickHouse minimize optimize joins denormalize
Purpose: Show the storage-latency trade-off.
Alt text: Denormalization duplicates dimensions during ingestion to avoid repeated large joins at query time.
Editorial note: Include historical-value semantics on the denormalized side.
-->

<!-- IMAGE PLACEHOLDER
Title: Dictionary lookup architecture
What to use: Event rows containing IDs performing direct lookups into a periodically refreshed in-memory dictionary.
Preferred source: ClickHouse dictionaries documentation.
Search terms: site:clickhouse.com/docs ClickHouse dictionary architecture diagram
Purpose: Explain dictionaries as a dimension-enrichment mechanism.
Alt text: ClickHouse maps dimension IDs to attributes through a refreshed dictionary.
Editorial note: Show the external source and refresh interval.
-->

<!-- IMAGE PLACEHOLDER
Title: Distributed join data movement
What to use: Non-co-located tables causing broadcast or shuffle, contrasted with tenant-co-sharded local joins.
Preferred source: ClickHouse distributed-query and JOIN guidance.
Search terms: site:clickhouse.com/docs ClickHouse distributed joins sharding key
Purpose: Make network cost visible.
Alt text: A distributed join moves data between shards unless related rows are co-located.
Editorial note: Show network arrows and intermediate row counts.
-->

# Updates, Deletes and Deduplication

## 88. Why Updates Are Different

MergeTree parts are immutable. ClickHouse may change data by:

- Inserting a newer version.
- Writing patch parts in supported lightweight updates.
- Rewriting parts through mutations.
- Applying delete masks.
- Cleaning data during merges.

This is more expensive than an OLTP row update.

## 89. Mutations

```sql
ALTER TABLE events
UPDATE status = 'INVALID'
WHERE event_id = ?;
```

```sql
ALTER TABLE events
DELETE
WHERE event_time < '2025-01-01';
```

Mutations can rewrite affected parts. Use for occasional corrections, not row-by-row application updates.

## 90. Lightweight Deletes

Lightweight deletes mark rows as deleted. Queries apply the delete mask; physical cleanup occurs later through merges.

## 91. Lightweight Updates

Current versions provide lightweight update capabilities using patch parts. This area is version-sensitive.

Verify:

- Server version.
- Supported engines.
- Read overhead before patches merge.
- Replication behavior.
- Limitations.

## 92. Versioned Inserts

For CDC and analytical updates:

```sql
ENGINE = ReplacingMergeTree(version)
ORDER BY (business_id)
```

is often better than frequent mutations.

## 93. `FINAL`

`FINAL` applies merge semantics during SELECT.

Advantages:

- Correct latest-row result before background merge.

Trade-offs:

- Additional CPU and memory.
- More rows processed.
- Higher latency.

Alternatives:

- Latest-version aggregation.
- Materialized latest-state table.
- Refreshable materialized view.
- Separate current-state store.

<!-- IMAGE PLACEHOLDER
Title: Immutable update strategies
What to use: Mutation rewriting parts, lightweight patch parts and ReplacingMergeTree inserting a new version.
Preferred source: ClickHouse updating-data overview and lightweight UPDATE documentation.
Search terms: site:clickhouse.com/docs ClickHouse updates mutations patch parts ReplacingMergeTree
Purpose: Show why updates have different physical costs.
Alt text: ClickHouse changes data by rewriting parts, applying patches or inserting newer versions.
Editorial note: Label version-sensitive features clearly.
-->

<!-- IMAGE PLACEHOLDER
Title: Lightweight delete lifecycle
What to use: Delete mask applied immediately, queries skipping masked rows and a later merge removing them physically.
Preferred source: ClickHouse lightweight-delete documentation.
Search terms: site:clickhouse.com/docs ClickHouse lightweight delete mask merge
Purpose: Explain logical versus physical deletion.
Alt text: ClickHouse first masks deleted rows and later removes them during merges.
Editorial note: Show temporary extra storage.
-->

<!-- IMAGE PLACEHOLDER
Title: FINAL query-time deduplication
What to use: Several parts containing duplicate versions flowing through a FINAL stage before filtering and aggregation.
Preferred source: ClickHouse ReplacingMergeTree and updating-data documentation.
Search terms: site:clickhouse.com/docs ClickHouse FINAL ReplacingMergeTree overhead
Purpose: Explain why correct latest-state reads can cost more.
Alt text: FINAL merges duplicate versions during SELECT before returning the latest logical rows.
Editorial note: Contrast with already merged parts.
-->

# TTL and Data Lifecycle

## 94. Row TTL

```sql
TTL event_time + INTERVAL 90 DAY
```

TTL actions are applied during merges, not at an exact second.

## 95. Column TTL

A large raw payload can expire earlier than the rest of the row.

Example:

```text
raw message retained 7 days
structured dimensions retained 365 days
```

## 96. Move and Recompression TTL

Older data can move through tiers:

```text
hot SSD -> warm disk -> object storage
```

Older data can also be recompressed using a stronger codec.

## 97. Rollup TTL

Example:

```text
raw per-second metrics for 7 days
minute aggregates for 90 days
hourly aggregates for 2 years
```

## 98. Drop Partition

```sql
ALTER TABLE events
DROP PARTITION '202601';
```

Dropping a whole partition is far cheaper than deleting historical rows individually.

## 99. TTL Merge Pressure

If merge capacity falls behind:

- Expired rows remain on disk.
- Storage grows.
- Cleanup is delayed.
- Emergency deletion becomes difficult.

<!-- IMAGE PLACEHOLDER
Title: ClickHouse data lifecycle
What to use: Fresh data on hot storage, older parts moved to warm/object storage, payload columns expired and final rows deleted.
Preferred source: ClickHouse TTL and storage-policy documentation.
Search terms: site:clickhouse.com/docs ClickHouse TTL move delete recompress diagram
Purpose: Show lifecycle management beyond simple deletion.
Alt text: ClickHouse TTL rules can expire columns, recompress data, move parts and eventually delete rows.
Editorial note: Include merge-driven execution rather than an exact timer.
-->

<!-- IMAGE PLACEHOLDER
Title: Raw-to-rollup retention pyramid
What to use: Recent raw seconds, longer-lived minute aggregates and long-lived hourly aggregates.
Preferred source: ClickHouse TTL and materialized-view documentation.
Search terms: site:clickhouse.com/docs ClickHouse TTL rollup time series
Purpose: Explain multi-resolution retention.
Alt text: ClickHouse keeps recent raw data and progressively retains coarser aggregate resolutions.
Editorial note: Use one metrics example with explicit retention periods.
-->

<!-- IMAGE PLACEHOLDER
Title: Drop partition vs row delete
What to use: Dropping a monthly partition as one lifecycle operation versus rewriting many parts for individual deletes.
Preferred source: ClickHouse partition and mutation documentation.
Search terms: site:clickhouse.com/docs ClickHouse drop partition versus delete
Purpose: Show why retention should align with partitions.
Alt text: Dropping a time partition is more efficient than deleting historical rows individually.
Editorial note: Make clear that partitions are not query shards.
-->

# Replication

## 100. `ReplicatedMergeTree`

Replication is configured at the table level. One server can contain replicated and non-replicated tables.

## 101. ClickHouse Keeper

Keeper stores coordination metadata such as:

- Replica membership.
- Replication logs.
- Part metadata.
- Distributed DDL tasks.
- Coordination state.

Keeper does not store the analytical table data itself.

## 102. Replication Flow

1. A replica receives an insert and creates a part.
2. Replication metadata is recorded through Keeper.
3. Other replicas observe the replication log.
4. They fetch the part or reproduce supported work.
5. Replicas converge.

## 103. Multi-Leader Writes

ReplicatedMergeTree can accept writes on more than one replica. Many systems still route writes predictably to simplify operations and reduce imbalance.

## 104. Replica Lag

Causes:

- Network issues.
- Slow disk.
- Part-fetch backlog.
- Merge pressure.
- Mutations.
- Large parts.
- Keeper problems.

Replica reads may be stale.

## 105. Insert Quorum

Insert quorum can require a part to reach multiple replicas before success.

Trade-offs:

- Lower loss risk.
- Higher latency.
- Lower write availability during failures.
- Ambiguous timeout behavior.

## 106. Read Consistency

Options include:

- Read from the same replica that accepted the insert.
- Read from any replica with possible lag.
- Use consistency settings or synchronization where needed.
- Accept bounded staleness for dashboards.

<!-- IMAGE PLACEHOLDER
Title: ReplicatedMergeTree architecture
What to use: Two replicas of one shard plus a three-node Keeper ensemble; parts remain on replicas while Keeper holds metadata.
Preferred source: ClickHouse replication and Keeper documentation.
Search terms: site:clickhouse.com/docs ClickHouse ReplicatedMergeTree Keeper diagram
Purpose: Separate data replication from coordination.
Alt text: ClickHouse replicas store data parts while Keeper coordinates replication metadata.
Editorial note: Do not draw analytical rows inside Keeper.
-->

<!-- IMAGE PLACEHOLDER
Title: Replicated insert flow
What to use: Client inserts into Replica A, A creates a part and logs metadata, Replica B fetches the part after reading the replication log.
Preferred source: ClickHouse ReplicatedMergeTree documentation.
Search terms: site:clickhouse.com/docs ClickHouse replicated insert part fetch flow
Purpose: Explain asynchronous convergence.
Alt text: One ClickHouse replica creates a part and another fetches it through the replication process.
Editorial note: Add an acknowledgement point before or after quorum depending on configuration.
-->

<!-- IMAGE PLACEHOLDER
Title: Insert-quorum trade-off
What to use: One insert with acknowledgement after one, two or all replicas confirm.
Preferred source: ClickHouse replication and insert-quorum settings documentation.
Search terms: site:clickhouse.com/docs ClickHouse insert quorum diagram
Purpose: Show latency, availability and durability trade-offs.
Alt text: Insert quorum waits for multiple replicas before acknowledging and can reduce availability during failure.
Editorial note: Use RF=3 for clarity.
-->

<!-- IMAGE PLACEHOLDER
Title: Replica lag pipeline
What to use: Keeper log → replication queue → network fetch → local disk/merge, with bottlenecks highlighted.
Preferred source: ClickHouse system.replicas and replication-queue documentation.
Search terms: site:clickhouse.com/docs ClickHouse replication lag queue
Purpose: Provide an operational troubleshooting visual.
Alt text: Replica lag grows when fetch, disk or merge work cannot keep up with incoming parts.
Editorial note: Annotate queue age and queue length.
-->

# Sharding and Distributed Tables

## 107. Sharding Key

Good properties:

- Even storage and write distribution.
- Even query traffic.
- Query locality where useful.
- Stable calculation.
- Sufficient cardinality.

Examples:

```text
cityHash64(user_id)
cityHash64(tenant_id)
cityHash64(event_id)
```

## 108. Random vs Locality-Aware Sharding

### Random or event sharding

Advantages:

- Even storage and writes.

Trade-off:

- Tenant queries touch every shard.

### Tenant sharding

Advantages:

- Tenant queries can target one shard.
- Tenant-local joins.

Trade-off:

- Large tenants create skew.

### Hybrid

```text
hash(tenant_id, bucket)
```

Splits very large tenants across several shards.

## 109. Distributed Table Engine

A `Distributed` table stores no data. It routes reads and optionally writes across local tables.

```text
events_local       -> ReplicatedMergeTree
events_distributed -> Distributed
```

## 110. Distributed Read

1. Determine shards.
2. Select replicas.
3. Send remote subqueries.
4. Perform local filtering and partial aggregation.
5. Merge final result.

## 111. Distributed Insert

Options:

- Insert through the Distributed table.
- Compute the shard in the application and insert directly to a local table.

Direct local inserts give clearer routing and acknowledgement but increase client complexity.

## 112. `internal_replication`

With internal replication, the Distributed layer sends a row to one replica and ReplicatedMergeTree copies it within the shard.

Avoid configuring both layers to replicate the same row independently.

## 113. Shard Pruning

If a query filter is compatible with the sharding expression, ClickHouse can avoid unrelated shards.

```text
shard by tenant_id
query WHERE tenant_id = 123
```

## 114. Resharding

Adding a node does not automatically rebalance every historical row.

Possible migration:

1. Create a new shard layout.
2. Route new data or dual-write.
3. Backfill historical data with `INSERT SELECT`.
4. Validate counts and duplicates.
5. Cut over reads.
6. Retire old layout.

## 115. Distributed DDL

`ON CLUSTER` coordinates schema operations across nodes. Monitor failed tasks and schema consistency.

<!-- IMAGE PLACEHOLDER
Title: Sharding-key comparison
What to use: Random event sharding, tenant sharding and tenant-plus-bucket sharding, showing balance and fan-out.
Preferred source: ClickHouse sharding and horizontal-scaling documentation.
Search terms: site:clickhouse.com/docs ClickHouse sharding key tenant hash
Purpose: Make locality versus balance trade-offs explicit.
Alt text: Random sharding balances rows, tenant sharding localizes queries and hybrid sharding splits large tenants.
Editorial note: Add one skewed enterprise tenant.
-->

<!-- IMAGE PLACEHOLDER
Title: Local and Distributed tables
What to use: Physical local tables on each shard with a Distributed table providing one logical cluster-wide view.
Preferred source: ClickHouse Distributed table-engine documentation.
Search terms: site:clickhouse.com/docs ClickHouse local table distributed table diagram
Purpose: Clarify that Distributed tables store no data.
Alt text: A ClickHouse Distributed table routes queries to physical local tables on each shard.
Editorial note: Use dashed borders for the logical table.
-->

<!-- IMAGE PLACEHOLDER
Title: Distributed insert with internal replication
What to use: Distributed table selects one shard replica; ReplicatedMergeTree then copies the part to the second replica.
Preferred source: ClickHouse Distributed and ReplicatedMergeTree documentation.
Search terms: site:clickhouse.com/docs ClickHouse internal_replication distributed insert
Purpose: Show how to avoid double replication.
Alt text: The Distributed engine sends each row to one replica and the table engine replicates it inside the shard.
Editorial note: Clearly separate sharding from replication arrows.
-->

<!-- IMAGE PLACEHOLDER
Title: Shard pruning
What to use: A tenant query routed to one shard and a global query fanning out to every shard.
Preferred source: ClickHouse Distributed-engine and sharding documentation.
Search terms: site:clickhouse.com/docs ClickHouse shard pruning optimize_skip_unused_shards
Purpose: Show how sharding-key filters reduce work.
Alt text: Queries containing the sharding key can avoid unrelated ClickHouse shards.
Editorial note: Include coordinator work on both paths.
-->

<!-- IMAGE PLACEHOLDER
Title: Cluster resharding migration
What to use: Old two-shard cluster and new four-shard cluster connected by controlled backfill and cutover.
Preferred source: Create an original diagram based on ClickHouse scaling documentation.
Search terms: ClickHouse resharding add shards migration
Purpose: Make clear that historical data needs an explicit migration.
Alt text: ClickHouse historical rows are copied into a new shard layout during a controlled resharding process.
Editorial note: Include temporary duplicate storage.
-->

# ClickHouse Cloud and Shared Storage

## 116. SharedMergeTree

ClickHouse Cloud uses SharedMergeTree-family engines designed for shared object storage.

```text
multiple compute replicas
          |
          v
 shared object storage
```

This differs from classic ReplicatedMergeTree, where replicas maintain their own local copies.

## 117. Cloud vs Self-Managed

Self-managed gives more control over topology, disks, Keeper, upgrades and tuning, but requires operational ownership.

ClickHouse Cloud manages more of the storage, replication and scaling model, with product-specific behavior and cost.

Do not apply self-managed Distributed-engine assumptions blindly to ClickHouse Cloud.

<!-- IMAGE PLACEHOLDER
Title: ReplicatedMergeTree vs SharedMergeTree
What to use: Classic replicas each owning full local copies versus several compute replicas using shared object storage.
Preferred source: ClickHouse SharedMergeTree documentation.
Search terms: site:clickhouse.com/docs SharedMergeTree shared storage architecture
Purpose: Distinguish cloud-native storage from classic replication.
Alt text: ReplicatedMergeTree stores separate replica copies while SharedMergeTree compute nodes use shared object storage.
Editorial note: Mark this as deployment-model specific.
-->

# Consistency and Data Freshness

## 118. Consistency Model

ClickHouse is designed for analytical throughput and availability, not serializable transactions.

Potential asynchronous stages include:

- Replica propagation.
- Kafka ingestion.
- Materialized-view updates.
- ReplacingMergeTree merges.
- Mutations.
- Distributed queries across replicas.

## 119. Read-After-Write

A client writing to one replica and immediately reading another may not observe the write.

Mitigations:

- Read from the same replica.
- Use insert quorum and appropriate consistency settings.
- Wait for replica synchronization where required.
- Accept bounded staleness.

## 120. End-to-End Freshness

Define a target such as:

```text
event visible on dashboard within 5 seconds
```

Budget includes:

- Producer buffering.
- Kafka delay.
- Consumer batching.
- Insert latency.
- Materialized-view processing.
- Replica lag.
- Dashboard cache.

## 121. Network Partition

During a partition:

- Strict quorum inserts can fail.
- Lower acknowledgement writes may proceed on reachable replicas.
- Distributed queries may fail or use available replicas depending on settings.
- Replicas converge after recovery.

## 122. Duplicate Visibility

Duplicates can come from:

- Upstream duplicate events.
- Changed retry block boundaries.
- Expired insert-deduplication window.
- Multiple pipelines.
- ReplacingMergeTree versions before merge.

<!-- IMAGE PLACEHOLDER
Title: End-to-end freshness timeline
What to use: Event creation → Kafka → batching → ClickHouse insert → materialized view → replica visibility → dashboard refresh.
Preferred source: Create an original diagram from ClickHouse ingestion and replication documentation.
Search terms: ClickHouse end to end data freshness Kafka materialized view replica
Purpose: Translate vague real-time claims into a measurable budget.
Alt text: Analytical freshness includes queueing, batching, insertion, replication and dashboard refresh delays.
Editorial note: Add example milliseconds or seconds as assumptions, not guarantees.
-->

<!-- IMAGE PLACEHOLDER
Title: Read-after-write across replicas
What to use: Write accepted by Replica A, immediate read routed to lagging Replica B and later convergence.
Preferred source: ClickHouse replication and consistency documentation.
Search terms: site:clickhouse.com/docs ClickHouse read after write replica lag
Purpose: Explain temporary stale reads.
Alt text: A read from a lagging replica may not immediately observe a write accepted by another replica.
Editorial note: Show a same-replica read succeeding for contrast.
-->

# Failure Scenarios

## 123. One Replica Fails

With another healthy replica:

- Reads can be routed to it.
- Inserts can continue if settings allow.
- The failed replica fetches missing parts after recovery.
- Capacity is reduced.
- Quorum settings may block writes.

## 124. All Replicas of One Shard Fail

The shard's data is unavailable.

A distributed query may fail or return partial results if configured to skip unavailable shards.

Never silently accept partial data for billing or compliance.

## 125. Keeper Quorum Fails

Local reads may continue for some operations, but coordination-dependent work can fail or stall:

- Replicated inserts.
- Replication-log operations.
- Distributed DDL.
- Topology changes.

Deploy Keeper across independent failure domains, typically as three or five nodes.

## 126. Disk Fills

Consequences:

- Inserts fail.
- Merges stall.
- Mutations stall.
- Replica fetches fail.
- Recovery becomes difficult.

Keep free space for inserts, merge output, mutations, replication and backups.

## 127. Merge Backlog

Causes:

- Tiny inserts.
- Slow disks.
- High ingestion.
- Materialized-view fan-out.
- Mutations and TTL cleanup.

Effects:

- Too many parts.
- Slower queries.
- More disk use.
- Delayed deduplication.
- Insert throttling.

## 128. Kafka Consumer Stops

Kafka retains events while lag grows. Recovery requires enough ClickHouse capacity to catch up without overwhelming merges.

## 129. Materialized View Failure

Maintain raw data and a replay/backfill path. Monitor source inserts, target counts and view errors.

## 130. Coordinator Fails Mid-Query

The client query fails even if shard work started. Retrying a read is logically safe, but a retry of a huge query can double cluster load.

## 131. Insert Timeout

Retry with the same deterministic block and deduplication token where applicable, using bounded backoff.

## 132. Missing or Corrupt Part

A healthy replica can provide the part. Without replicas, restore from backup or replay from Kafka/object storage.

<!-- IMAGE PLACEHOLDER
Title: Replica failure and catch-up
What to use: One replica offline while another serves traffic; returning replica consumes the queue and fetches missing parts.
Preferred source: ClickHouse replication documentation.
Search terms: site:clickhouse.com/docs ClickHouse replica failure catch up parts
Purpose: Show normal HA recovery.
Alt text: A failed ClickHouse replica later catches up by fetching missing parts from a healthy replica.
Editorial note: Include reduced capacity during the outage.
-->

<!-- IMAGE PLACEHOLDER
Title: Keeper quorum failure
What to use: Three Keeper nodes with two unavailable, highlighting coordination operations that stop while data remains on ClickHouse servers.
Preferred source: ClickHouse Keeper documentation.
Search terms: site:clickhouse.com/docs ClickHouse Keeper quorum failure
Purpose: Explain coordination as a separate failure domain.
Alt text: ClickHouse data remains on data nodes, but replicated coordination requires a healthy Keeper quorum.
Editorial note: Distinguish local SELECT from replicated INSERT.
-->

<!-- IMAGE PLACEHOLDER
Title: Disk-full feedback loop
What to use: High disk use → merge cannot write output → part count grows → inserts and queries worsen → disk pressure increases.
Preferred source: Create an original diagram from ClickHouse operations guidance.
Search terms: ClickHouse disk full merge backlog too many parts
Purpose: Show why disk headroom is mandatory.
Alt text: Low disk space blocks merges and creates more part and performance pressure.
Editorial note: Include an alert threshold before the critical point.
-->

<!-- IMAGE PLACEHOLDER
Title: Kafka catch-up after outage
What to use: Kafka lag accumulating while ingestion is down and controlled catch-up after recovery with merge backpressure.
Preferred source: ClickHouse Kafka integration documentation.
Search terms: site:clickhouse.com/docs ClickHouse Kafka consumer lag recovery
Purpose: Explain recovery capacity planning.
Alt text: After an outage, ClickHouse consumers drain Kafka lag without overwhelming parts and merges.
Editorial note: Show a catch-up rate higher than live arrival rate.
-->

# Capacity Planning

## 133. Inputs

Estimate:

```text
events per second
peak multiplier
uncompressed row size
compression ratio
retention
replica count
derived-table factor
query scans
query concurrency
merge amplification
mutation volume
network transfer
target disk utilization
failure headroom
```

## 134. Raw Ingest Volume

```text
raw bytes/day
= events/s × 86,400 × bytes/event
```

Example:

```text
200,000 events/s × 86,400 × 500 bytes
= 8.64 TB/day uncompressed
```

## 135. Compressed Storage

At an assumed measured compression ratio of `5:1`:

```text
8.64 TB / 5
≈ 1.73 TB/day
```

## 136. Retention and Replication

For 30 days:

```text
1.73 × 30
≈ 51.9 TB
```

With two replicas:

```text
51.9 × 2
≈ 103.8 TB
```

## 137. Derived Data and Headroom

Add:

- Materialized aggregate tables.
- Projections.
- Skip indexes.
- Merge temporary space.
- Mutations.
- Backups where local.
- Free-space target.

Example:

```text
103.8 TB × 1.35 overhead / 0.60 target utilization
≈ 233.6 TB provisioned
```

This is a planning assumption, not a ClickHouse rule.

## 138. Nodes for Storage

At 8 TB usable analytical capacity per node:

```text
233.6 / 8
≈ 29.2 nodes
```

A topology such as:

```text
16 shards × 2 replicas = 32 nodes
```

may fit.

## 139. Shards for Ingestion

```text
shards
= peak rows/s / sustainable rows/s per shard
```

Assume:

```text
600,000 peak rows/s
75,000 safe rows/s/shard
```

```text
600,000 / 75,000 = 8 shards
```

The per-shard number must come from a production-like benchmark.

## 140. Query Scan Demand

```text
query scan demand
= query QPS × bytes scanned/query
```

Example:

```text
100 QPS × 500 MB
= 50 GB/s logical scan demand
```

If pre-aggregation reduces each query to 5 MB:

```text
100 × 5 MB = 500 MB/s
```

Schema design can reduce hardware needs by orders of magnitude.

## 141. CPU, Memory, Disk and Network

CPU is shared by queries, merges, compression, views and mutations.

Memory is used by indexes, metadata, aggregation hash tables, joins, sorting, buffers and caches. The full dataset does not need to fit in RAM.

Disk must support foreground inserts and background rewrites. Network carries inserts, replication, distributed results, resharding and backups.

## 142. Final Capacity Formula

```text
required shards
= max(
    shards for storage,
    shards for ingestion,
    shards for query CPU,
    shards for scan bandwidth,
    shards for memory,
    shards for failure headroom
)
```

<!-- IMAGE PLACEHOLDER
Title: ClickHouse capacity-planning funnel
What to use: Event rate, row size, compression, retention and replicas flowing into storage, shard and node calculations.
Preferred source: Create an original diagram from this guide and ClickHouse operations concepts.
Search terms: ClickHouse capacity planning events compression retention replicas
Purpose: Provide a reusable HLD estimation framework.
Alt text: ClickHouse capacity planning converts ingest volume and retention into compressed replicated storage and shard counts.
Editorial note: Separate assumptions from measured inputs.
-->

<!-- IMAGE PLACEHOLDER
Title: Raw-to-provisioned storage waterfall
What to use: Raw bytes → compression → retention → replicas → derived tables → merge overhead → target utilization.
Preferred source: Create an original diagram from the numerical example.
Search terms: ClickHouse storage estimation compression replication overhead
Purpose: Make storage multipliers visible.
Alt text: Provisioned ClickHouse storage includes compression, retention, replicas, derived data and operational headroom.
Editorial note: Put actual example values on each step.
-->

<!-- IMAGE PLACEHOLDER
Title: Pre-aggregation hardware impact
What to use: Raw dashboard queries scanning 500 MB each versus aggregate-table queries scanning 5 MB each.
Preferred source: ClickHouse materialized-view documentation.
Search terms: site:clickhouse.com/docs ClickHouse pre aggregation bytes scanned
Purpose: Show that schema design can matter more than adding nodes.
Alt text: Pre-aggregated ClickHouse tables reduce per-query scan volume and cluster demand.
Editorial note: Use the capacity example's 100 QPS calculation.
-->

# Monitoring and Operations

## 143. Important System Tables

### `system.query_log`

Use for:

- Query duration.
- Rows and bytes read.
- Peak memory.
- Exceptions.
- Result size.
- Query text and user.

### `system.parts`

Use for:

- Active parts.
- Rows and bytes.
- Partitions.
- Compression.
- Part age.

### `system.part_log`

Use for part creation, merges, downloads, mutations and failures.

### `system.merges`

Use for active merge progress and resource use.

### `system.mutations`

Use for mutation status, progress and errors.

### `system.replicas`

Use for:

- Replica health.
- Queue size.
- Delay.
- Read-only state.
- Keeper connectivity.

### `system.replication_queue`

Use for individual replication tasks and failure reasons.

## 144. Query Metrics

Track:

- QPS.
- p50, p95 and p99 latency.
- Rows and bytes read.
- Peak memory.
- Query failures and timeouts.
- Result size.
- Query concurrency.
- Slow query fingerprints.

## 145. Ingestion Metrics

Track:

- Rows and bytes inserted per second.
- Insert latency.
- Batch size.
- Part creation rate.
- Rejected inserts.
- Async-buffer behavior.
- Kafka lag.
- Parse errors.
- Materialized-view failures.

## 146. Merge and Replication Metrics

Track:

- Active parts per partition.
- Parts created versus merged.
- Merge bytes and duration.
- Background-pool utilization.
- Mutation backlog.
- Replica delay and queue length.
- Oldest replication task.
- Part-fetch failures.

## 147. Resource Metrics

Track:

- CPU.
- Memory.
- Disk utilization and throughput.
- IOPS.
- Network.
- Temporary disk.
- File descriptors.
- Object-storage traffic.

## 148. Alerts

Alert on:

- Disk above planned threshold.
- Rapid part-count growth.
- Merge backlog.
- Replica lag.
- Read-only replica.
- Keeper quorum loss.
- Kafka lag.
- Mutation failure.
- View failure.
- Query-memory failure.
- Insert rejection.
- Backup failure.

<!-- IMAGE PLACEHOLDER
Title: ClickHouse operations dashboard
What to use: A dashboard grouping query, ingestion, parts/merges, replication, disk and Keeper health.
Preferred source: ClickHouse system-table and monitoring documentation.
Search terms: site:clickhouse.com/docs ClickHouse monitoring metrics system tables
Purpose: Show what a production operations dashboard should contain.
Alt text: A ClickHouse operations dashboard tracks query latency, inserts, merges, replication queues, disk and Keeper health.
Editorial note: Use one panel per failure domain.
-->

<!-- IMAGE PLACEHOLDER
Title: Part-health timeline
What to use: Per-partition timeline showing parts created, merges completed and active part count, with a backlog warning.
Preferred source: ClickHouse system.parts, system.part_log and system.merges documentation.
Search terms: site:clickhouse.com/docs system.parts system.merges ClickHouse
Purpose: Connect tiny-insert problems to observable metrics.
Alt text: Part creation outpacing merges causes active part count and backlog to rise.
Editorial note: Include a healthy and unhealthy period.
-->

# Backups and Recovery

## 149. Backup Scope

A complete strategy includes:

- Table data.
- Table metadata.
- Users and access configuration where needed.
- Dictionaries.
- Keeper metadata where appropriate.
- Encryption keys.
- Offsite storage.
- Backup catalogue and retention.

## 150. Replication Is Not Backup

Replication copies good and bad operations:

- Inserts.
- Deletes.
- Mutations.
- Logical mistakes.

Backups protect against accidental deletion, corruption, operator error and regional loss.

## 151. Restore Testing

Test:

- Full restore.
- One table.
- One partition.
- Schema compatibility.
- Restore duration.
- Topology recreation.
- Materialized-view reconstruction.
- Query validation.

## 152. Replay-Based Recovery

For append-only events:

```text
Kafka or object storage
       |
       v
recreate ClickHouse tables
```

Requirements:

- Sufficient retention.
- Stable schema.
- Deterministic transforms.
- Idempotent ingestion.
- Capacity for replay.
- Derived-table backfill plan.

<!-- IMAGE PLACEHOLDER
Title: Replication vs backup
What to use: A destructive DELETE replicated to every replica, contrasted with an independent historical backup enabling restore.
Preferred source: Create an original diagram based on ClickHouse backup and replication documentation.
Search terms: ClickHouse replication is not backup
Purpose: Prevent a common durability misconception.
Alt text: Replication copies logical mistakes to every replica, while an independent backup preserves an earlier state.
Editorial note: Show the same delete propagating successfully.
-->

<!-- IMAGE PLACEHOLDER
Title: Disaster-recovery replay
What to use: Kafka or object storage replaying historical events into recreated raw and aggregate ClickHouse tables.
Preferred source: ClickHouse Kafka, S3 and backup documentation.
Search terms: site:clickhouse.com/docs ClickHouse rebuild from Kafka S3
Purpose: Show a replay-based recovery strategy.
Alt text: Historical events are replayed to rebuild ClickHouse raw tables and materialized aggregates.
Editorial note: Include replay progress and validation checks.
-->

# Security and Workload Governance

## 153. Network and Authentication

Use:

- Private networking.
- TLS.
- Firewall rules.
- Restricted native and HTTP ports.
- Separate development and production deployments.

## 154. Users and Roles

Create separate identities for:

- Ingestion.
- Dashboards.
- Analysts.
- ETL.
- Administrators.

Grant only required databases, tables, commands and settings.

## 155. Quotas and Limits

Protect the cluster with:

- Query time limits.
- Memory limits.
- Result-size limits.
- Read-row and read-byte limits.
- Concurrent-query limits.
- Workload profiles.
- Per-user settings.

One unbounded analyst query should not take down customer dashboards.

## 156. Tenant Isolation

Options:

- Row policies.
- Separate tables.
- Separate databases.
- Separate clusters.
- Query gateway and application authorization.

Do not rely only on a user-supplied `WHERE tenant_id = ?` predicate for security.

<!-- IMAGE PLACEHOLDER
Title: ClickHouse workload isolation
What to use: Ingestion, dashboard and analyst users entering separate queues or resource groups with different limits.
Preferred source: ClickHouse workload-management, users and quotas documentation.
Search terms: site:clickhouse.com/docs ClickHouse workload management quotas diagram
Purpose: Show how to protect latency-sensitive workloads.
Alt text: ClickHouse assigns different CPU, memory and timeout limits to ingestion, dashboard and analyst workloads.
Editorial note: Put customer-facing dashboards in the highest-priority lane.
-->

# Example Schemas

## 157. Ad Click Analytics

### Requirements

- Record impressions, clicks and conversions.
- Query by advertiser, campaign and time range.
- Group by country and device.
- Serve near-real-time dashboards.
- Retain raw data for 90 days.
- Retain aggregates longer.

### Raw table

```sql
CREATE TABLE ad_events
(
    event_time DateTime64(3),
    event_id UUID,
    event_type Enum8(
        'IMPRESSION' = 1,
        'CLICK' = 2,
        'CONVERSION' = 3
    ),
    advertiser_id UInt64,
    campaign_id UInt64,
    ad_id UInt64,
    country LowCardinality(String),
    device_type LowCardinality(String),
    user_id String,
    spend Decimal(18, 6),
    revenue Decimal(18, 6)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_time)
ORDER BY (
    advertiser_id,
    campaign_id,
    event_type,
    event_time,
    event_id
)
TTL event_time + INTERVAL 90 DAY;
```

### Query

```sql
SELECT
    toStartOfHour(event_time) AS hour,
    countIf(event_type = 'IMPRESSION') AS impressions,
    countIf(event_type = 'CLICK') AS clicks,
    clicks / nullIf(impressions, 0) AS ctr,
    sum(spend) AS spend
FROM ad_events
WHERE advertiser_id = ?
  AND campaign_id = ?
  AND event_time >= ?
  AND event_time < ?
GROUP BY hour
ORDER BY hour;
```

Create hourly and daily materialized tables for frequent dashboards.

<!-- IMAGE PLACEHOLDER
Title: Ad analytics raw and aggregate schema
What to use: Raw ad events feeding hourly and daily materialized aggregate tables, with dashboards selecting the proper resolution.
Preferred source: Create an original diagram based on ClickHouse materialized-view documentation.
Search terms: ClickHouse ad analytics raw aggregate materialized view
Purpose: Show a complete HLD analytical serving design.
Alt text: Raw ad events are retained briefly while hourly and daily aggregate tables serve dashboards.
Editorial note: Show impression, click, CTR and spend metrics.
-->

## 158. Log Analytics

```sql
CREATE TABLE logs
(
    timestamp DateTime64(3),
    service LowCardinality(String),
    environment LowCardinality(String),
    level Enum8(
        'DEBUG' = 1,
        'INFO' = 2,
        'WARN' = 3,
        'ERROR' = 4
    ),
    trace_id String,
    host LowCardinality(String),
    message String,
    attributes Map(String, String)
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (
    environment,
    service,
    level,
    timestamp
)
TTL timestamp + INTERVAL 30 DAY;
```

This supports service, level and time-range queries. Trace lookup may need a projection, Bloom index or separate table.

<!-- IMAGE PLACEHOLDER
Title: Log query access paths
What to use: Logs sorted by environment/service/level/time, with service-time queries using the primary index and trace-ID lookup using a projection or Bloom index.
Preferred source: ClickHouse observability and primary-index documentation.
Search terms: site:clickhouse.com/docs ClickHouse logs ORDER BY trace id projection bloom
Purpose: Show primary and secondary access patterns.
Alt text: Service and time filters use the sorting key while trace lookup uses an alternate access path.
Editorial note: Include a large message column read only after filtering.
-->

## 159. URL Shortener Analytics

```sql
CREATE TABLE url_clicks
(
    click_time DateTime64(3),
    short_code String,
    click_id UUID,
    country LowCardinality(String),
    device LowCardinality(String),
    referrer_domain LowCardinality(String),
    user_agent String
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(click_time)
ORDER BY (
    short_code,
    click_time,
    click_id
);
```

```sql
SELECT count()
FROM url_clicks
WHERE short_code = ?
  AND click_time >= ?
  AND click_time < ?;
```

For only one lifetime count, Redis or a pre-aggregated counter may be simpler. ClickHouse becomes valuable when time ranges and dimensions are required.

<!-- IMAGE PLACEHOLDER
Title: URL analytics database choice
What to use: Lifetime count → Redis or aggregate counter; time-range and dimensional analysis → ClickHouse.
Preferred source: Create an original comparison from Redis and ClickHouse workload characteristics.
Search terms: ClickHouse URL shortener click count analytics
Purpose: Clarify when ClickHouse is justified.
Alt text: Simple lifetime counts use a counter store, while flexible time-range analytics use ClickHouse.
Editorial note: Include an intermediate pre-aggregated ClickHouse option.
-->

## 160. Metrics

```sql
CREATE TABLE metrics
(
    timestamp DateTime64(3),
    metric_name LowCardinality(String),
    service LowCardinality(String),
    labels Map(String, String),
    value Float64 CODEC(Gorilla, ZSTD)
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (
    metric_name,
    service,
    timestamp
)
TTL timestamp + INTERVAL 30 DAY;
```

Promote commonly filtered labels to dedicated columns. Arbitrary high-cardinality labels can make filtering expensive.

## 161. E-Commerce CDC

The transactional order remains in PostgreSQL.

```sql
CREATE TABLE orders_analytics
(
    order_id UInt64,
    version UInt64,
    is_deleted UInt8,
    updated_at DateTime64(3),
    created_at DateTime64(3),
    user_id UInt64,
    country LowCardinality(String),
    status LowCardinality(String),
    amount Decimal(18, 2)
)
ENGINE = ReplacingMergeTree(version)
PARTITION BY toYYYYMM(created_at)
ORDER BY (order_id);
```

For frequent aggregate dashboards, build a deduplicated serving table rather than running broad `FINAL` queries repeatedly.

<!-- IMAGE PLACEHOLDER
Title: PostgreSQL CDC to ClickHouse
What to use: PostgreSQL handling transactions, CDC transporting changes and ReplacingMergeTree storing analytical versions, followed by aggregate views.
Preferred source: ClickHouse PostgreSQL CDC documentation.
Search terms: site:clickhouse.com/docs ClickHouse PostgreSQL CDC architecture
Purpose: Show the common OLTP plus OLAP architecture.
Alt text: PostgreSQL remains the transactional source while CDC replicates versioned data into ClickHouse for analytics.
Editorial note: Show update and delete records explicitly.
-->

## 162. Product Analytics

```sql
CREATE TABLE product_events
(
    event_time DateTime64(3),
    tenant_id UInt64,
    event_name LowCardinality(String),
    user_id String,
    session_id String,
    page LowCardinality(String),
    properties Map(String, String)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_time)
ORDER BY (
    tenant_id,
    event_name,
    event_time,
    user_id
);
```

Supports DAU, funnels, retention, event counts and user journeys. Common funnels may need dedicated aggregates or projections.

## 163. Top-K

```sql
SELECT
    item_id,
    sum(weight) AS score
FROM item_events
WHERE event_time >= now() - INTERVAL 1 HOUR
GROUP BY item_id
ORDER BY score DESC
LIMIT 100;
```

At high QPS:

- Pre-aggregate by minute.
- Merge the last 60 buckets.
- Use approximate Top-K candidates where acceptable.
- Avoid rescanning raw events for every request.

<!-- IMAGE PLACEHOLDER
Title: Top-K pre-aggregation
What to use: Raw events aggregated into per-minute item scores, followed by a query merging 60 buckets and returning top 100.
Preferred source: ClickHouse materialized-view and topK documentation.
Search terms: site:clickhouse.com/docs ClickHouse topK materialized view
Purpose: Show how to avoid rescanning raw events.
Alt text: ClickHouse pre-aggregates item scores into minute buckets before computing a recent Top-K.
Editorial note: Add exact and approximate branches.
-->

## 164. Time-Range Click Count Only

ClickHouse can be a good fit when:

- Event volume is high.
- Time ranges vary.
- Retention is long.
- Query latency tolerates analytical execution.
- Dimensions may be added later.

It can be unnecessary overhead when the only result is one permanently maintained number.

# ClickHouse vs Other Databases

## 165. Comparison Table

| System | Best at | Limitation compared with ClickHouse |
|---|---|---|
| PostgreSQL | Transactions, constraints, joins and point updates | Less efficient for very large analytical scans |
| Cassandra | High-write partition-key serving | Limited ad-hoc aggregation |
| Redis | Cache, counters, rate limiting and hot state | Memory cost and weak fit for historical scans |
| Elasticsearch | Full-text search and document retrieval | Often heavier for structured aggregation and storage |
| BigQuery | Serverless warehouse and large ad-hoc scans | Different latency and cost profile for high-QPS serving |
| Snowflake | Managed enterprise warehouse | Different real-time serving and cost model |
| Druid | Real-time OLAP and rollups | Different ingestion and SQL model |
| Pinot | Low-latency user-facing analytics | Different operational and indexing model |
| TimescaleDB | PostgreSQL-compatible time series | Less optimized for broad columnar scans at very large scale |
| ClickHouse | Real-time columnar analytics | Weak fit for transactional row updates |

## 166. ClickHouse vs PostgreSQL

Choose ClickHouse for large scans, aggregation, append-heavy data and analytical concurrency.

Choose PostgreSQL for transactions, constraints, point operations and normalized relational logic.

```text
PostgreSQL -> transactional truth
CDC/Kafka  -> ClickHouse analytics
```

## 167. ClickHouse vs Cassandra

```text
Get events for device X on day D
-> Cassandra may fit

Group every device by country and hour for 30 days
-> ClickHouse fits
```

## 168. ClickHouse vs Redis

Redis serves hot state, counters and cache. ClickHouse serves historical multi-dimensional analytics.

A common system caches hot ClickHouse dashboard results in Redis.

## 169. ClickHouse vs Elasticsearch

Choose Elasticsearch for relevance-ranked full-text and fuzzy document search. Choose ClickHouse for structured filtering, scans and aggregation.

## 170. ClickHouse vs BigQuery

ClickHouse often fits interactive low-latency, high-QPS analytical serving. BigQuery often fits serverless, infrequent, very large ad-hoc scans.

Compare actual latency, concurrency, operations and cost.

## 171. ClickHouse vs Druid or Pinot

All target real-time analytics. The choice depends on SQL needs, ingestion, indexing, query concurrency, ecosystem and operational expertise.

## 172. ClickHouse vs TimescaleDB

TimescaleDB fits PostgreSQL-compatible relational time series. ClickHouse fits larger columnar scans and aggregation-heavy workloads.

<!-- IMAGE PLACEHOLDER
Title: Analytical database-selection matrix
What to use: ClickHouse, PostgreSQL, Cassandra, Redis, Elasticsearch and BigQuery plotted by query shape and storage/latency model.
Preferred source: Create an original diagram using official documentation for each system.
Search terms: ClickHouse database comparison OLAP Redis Cassandra PostgreSQL
Purpose: Provide a quick interview database-selection reference.
Alt text: ClickHouse occupies the large-scale analytical aggregation region, separate from transactional, cache, search and key-serving systems.
Editorial note: Use qualitative axes rather than unverifiable universal performance numbers.
-->

# Common Mistakes

## 173. Treating Primary Key as Unique

ClickHouse primary keys do not prevent duplicates.

## 174. Choosing `ORDER BY` from Arrival Order

Do not use time first only because events arrive by time. Choose based on query filters.

## 175. Over-Partitioning

Bad:

```sql
PARTITION BY user_id
```

Use coarse lifecycle partitions.

## 176. Tiny Inserts

Do not send one INSERT per event. Batch or use async inserts.

## 177. Expecting Immediate ReplacingMergeTree Deduplication

Merges are asynchronous. Use correct query-time semantics.

## 178. Running Every Query with `FINAL`

`FINAL` can be expensive. Build a better serving model when it is required everywhere.

## 179. Frequent Mutations

Row-by-row mutation turns an append-optimized OLAP system into an inefficient OLTP imitation.

## 180. `SELECT *`

It defeats column pruning and increases disk, CPU, memory and network work.

## 181. Assuming `LIMIT` Prevents Scans

Global aggregation or sorting can still process all matching rows.

## 182. Adding Skip Indexes Everywhere

Indexes add storage, insert CPU and merge work. Use them only when data distribution allows meaningful skipping.

## 183. Bad Sharding Key

Random sharding can make tenant queries fan out. Tenant sharding can create a hot enterprise tenant.

## 184. No Merge Capacity

Ingestion throughput without merge throughput eventually fails.

## 185. No Raw Replay Source

If a materialized view is wrong and raw data is gone, rebuilding may be impossible.

## 186. Using ClickHouse for One Counter

A dedicated counter or pre-aggregated store may be simpler.

## 187. Ignoring End-to-End Freshness

Measure event creation to dashboard visibility, not only INSERT latency.

## 188. No Workload Isolation

One analyst query can starve dashboards and ingestion.

## 189. Assuming Replication Is Backup

Logical mistakes replicate. Maintain independent recovery.

<!-- IMAGE PLACEHOLDER
Title: ClickHouse anti-patterns
What to use: A poster showing tiny inserts, user-ID partitioning, SELECT *, FINAL everywhere, row mutations and a hot shard, each paired with a correction.
Preferred source: Create an original diagram from ClickHouse best practices.
Search terms: site:clickhouse.com/docs ClickHouse best practices mistakes
Purpose: Provide a memorable interview review visual.
Alt text: Common ClickHouse mistakes include tiny inserts, over-partitioning, poor sorting keys, broad FINAL queries and frequent mutations.
Editorial note: Keep each anti-pattern to one sentence.
-->

# Interview Decision Framework

## 190. Choose ClickHouse When

```text
[ ] Queries scan many rows.
[ ] Queries read a subset of columns.
[ ] GROUP BY and aggregation are common.
[ ] Data is append-heavy.
[ ] Fresh data must be queryable quickly.
[ ] Data can be denormalized.
[ ] Updates are less frequent than inserts.
[ ] Columnar compression matters.
[ ] Query patterns benefit from sorted storage.
[ ] Horizontal analytical scale is required.
```

## 191. Avoid ClickHouse When

```text
[ ] Multi-row transactions are central.
[ ] Frequent point updates are required.
[ ] Foreign keys or unique constraints are required.
[ ] Point reads dominate.
[ ] A queue, lock or cache is needed.
[ ] Strict cross-row consistency is required.
[ ] A single exact counter is the only analytical requirement.
```

## 192. Table Design Checklist

```text
[ ] Write down exact query patterns.
[ ] Identify frequently filtered dimensions.
[ ] Choose ORDER BY from those filters.
[ ] Confirm prefix behavior.
[ ] Choose coarse PARTITION BY for lifecycle.
[ ] Estimate rows and bytes per partition.
[ ] Select the correct table engine.
[ ] Choose compact data types.
[ ] Define retention and TTL.
[ ] Define insert batch size.
[ ] Define retry and duplicate behavior.
[ ] Decide whether materialized views are required.
[ ] Justify projections and skip indexes.
[ ] Estimate merge load.
[ ] Benchmark rows and bytes read.
```

## 193. Cluster Checklist

```text
[ ] Can one node meet storage and throughput?
[ ] How many shards are needed?
[ ] What is the sharding key?
[ ] How many replicas per shard?
[ ] Are replicas in separate failure domains?
[ ] Is Keeper highly available?
[ ] What insert acknowledgement is required?
[ ] Can replica reads be stale?
[ ] How is DDL deployed consistently?
[ ] How will shards be added later?
[ ] What is the backup and replay strategy?
[ ] What happens if one shard is unavailable?
```

<!-- IMAGE PLACEHOLDER
Title: ClickHouse design decision tree
What to use: Query shape and update rate leading to engine, ORDER BY, partitioning, materialized views, indexes and cluster topology.
Preferred source: Create an original diagram from this guide and ClickHouse best practices.
Search terms: ClickHouse schema design decision tree ORDER BY partition engine
Purpose: Provide a reusable interview workflow.
Alt text: The ClickHouse design process chooses table engine, sorting key, partitions, derived tables and cluster topology from workload requirements.
Editorial note: Make this the final major diagram before interview questions.
-->

# Interview Questions and Answers

## 194. Why Is ClickHouse Fast?

It combines columnar storage, selective column reads, compression, sorted MergeTree parts, sparse indexes, data skipping, vectorized execution, parallelism, materialized aggregates and distributed execution.

## 195. Why Is It Better for OLAP Than PostgreSQL?

ClickHouse is optimized for scanning and aggregating selected columns over many rows. PostgreSQL is optimized for transactions, complete rows, indexes, constraints and updates.

## 196. What Is a Data Part?

An immutable sorted set of rows created by an insert or merge, containing compressed column files, marks, indexes and metadata.

## 197. What Is a Granule?

The smallest common row range normally selected through MergeTree indexes. The primary index stores one entry per granule rather than per row.

## 198. Is the Primary Key Unique?

No. It defines a sparse index and does not enforce uniqueness.

## 199. `ORDER BY` vs `PRIMARY KEY`?

`ORDER BY` defines physical row order. `PRIMARY KEY` defines the sparse-index tuple and must be a prefix when separately declared.

## 200. Partitioning vs Sharding?

Partitioning groups local parts for lifecycle and coarse pruning. Sharding distributes rows across servers.

## 201. Why Should Time Not Always Be First in `ORDER BY`?

Tenant-specific queries may scan data for every tenant in the time range. Common selective dimensions often belong before time.

## 202. Why Are Small Inserts Bad?

Every insert creates parts. Too many tiny parts increase metadata and merge pressure and can cause insert rejection.

## 203. What Are Background Merges?

ClickHouse combines immutable parts into larger parts, applies engine-specific semantics and reduces part count. Merges consume CPU, disk and temporary space.

## 204. Why Does the Dataset Not Need to Fit in RAM?

Compressed data remains on disk. RAM is used for indexes, metadata, caches and query state.

## 205. What Is `PREWHERE`?

It reads selective filter columns first and reads remaining columns only for surviving rows.

## 206. What Is a Data-Skipping Index?

Block-level metadata that skips granules guaranteed not to match. It is not a per-row B-tree index.

## 207. How Do You Choose a Skip Index?

Use minmax for correlated ranges, set for few values per block and Bloom-based indexes for sparse equality or membership. Benchmark actual distribution.

## 208. What Is an Incremental Materialized View?

It transforms each newly inserted source block and inserts results into a target table, moving computation to ingestion time.

## 209. Does It Process Existing Data?

No. Historical data requires backfill.

## 210. Projection vs Materialized View?

A projection is an alternate representation inside the table selected by the optimizer. A materialized view writes to an independent target table.

## 211. What Is ReplacingMergeTree?

An engine that stores versions with the same sorting key and removes older versions during background merges. Deduplication is eventual.

## 212. Why Is `FINAL` Expensive?

It applies replacement or collapsing during SELECT and processes duplicate versions before returning the logical result.

## 213. How Should Frequent Updates Be Modelled?

Prefer versioned inserts and ReplacingMergeTree or a latest-state materialization. Use mutations for occasional corrections.

## 214. How Does Replication Work?

Replicas coordinate through Keeper. One replica creates or announces parts and other replicas fetch missing parts to converge.

## 215. Does ClickHouse Always Need Keeper?

Replicated self-managed tables require Keeper or compatible ZooKeeper coordination. A non-replicated single-node MergeTree table does not.

## 216. What Is a Distributed Table?

A routing table that stores no data itself and provides a cluster-wide view over local shard tables.

## 217. How Do You Choose a Sharding Key?

Balance storage, writes, query locality, join locality, tenant skew and shard pruning.

## 218. How Does Insert Retry Deduplication Work?

Replicated MergeTree can suppress recently repeated blocks. The retry must preserve block identity and the deduplication window is finite.

## 219. ClickHouse or Cassandra for Events?

Cassandra for keyed partition reads and availability-focused serving; ClickHouse for broad scans, aggregation and group-by.

## 220. ClickHouse or Redis for Total Clicks?

Redis or a counter store for one hot number. ClickHouse for historical time ranges and multiple dimensions.

## 221. ClickHouse or BigQuery?

ClickHouse often fits interactive high-QPS analytics. BigQuery often fits serverless, infrequent large scans. Compare actual latency, operations and cost.

## 222. Why Is ClickHouse Good for Logs?

Logs are append-heavy, time-oriented and compressible. Structured columns can be filtered and aggregated without reading large message bodies.

## 223. How Do You Delete Old Data Efficiently?

Use TTL or drop complete time partitions rather than broad row-level mutations.

## 224. Why Are Merges Important for Capacity Planning?

Inserted bytes are rewritten as parts merge. Disk and CPU must support both incoming writes and merge amplification.

## 225. What Happens If Merges Fall Behind?

Part count rises, queries slow, TTL cleanup stalls and inserts may be delayed or rejected.

## 226. How Do You Optimize a Slow Query?

1. Inspect rows and bytes read.
2. Verify partition pruning.
3. Verify primary-index pruning.
4. Select only required columns.
5. Check PREWHERE and skip indexes.
6. Examine group cardinality and joins.
7. Consider materialized views or projections.
8. Check concurrency and limits.

## 227. Can ClickHouse Give Strong Read-After-Write?

A read from the same fresh replica can observe the insert, but replica-routed and distributed reads can see lag. Quorum and consistency settings improve guarantees at latency and availability cost.

## 228. What Is the Biggest Schema Mistake?

Choosing partition and sorting keys before writing down the actual query patterns.

# Thirty-Second Summary

```text
ClickHouse is a column-oriented OLAP database.

It is best for:
- Large analytical scans.
- GROUP BY and aggregation.
- Time-range analytics.
- Real-time dashboards.
- Logs, metrics, traces and events.
- High compression and append-heavy ingestion.

Its core rules are:
- Choose ORDER BY from query filters.
- Remember that primary keys are sparse and not unique.
- Use PARTITION BY for coarse lifecycle management.
- Batch inserts to avoid too many parts.
- Provision for background merges.
- Pre-aggregate frequent expensive queries.
- Add projections and skip indexes only when justified.
- Treat updates and deduplication as analytical, often asynchronous operations.
- Use shards for scale and replicas for availability.
- Define freshness, retries and recovery explicitly.

Do not use ClickHouse by default for:
- Transactional row updates.
- Foreign-key and uniqueness enforcement.
- Multi-row ACID workflows.
- Caching, locking or queues.
- A single exact counter.
```

<!--
EDITORIAL SOURCES TO VERIFY BEFORE PUBLISHING

Use current official ClickHouse documentation as the primary source:

- ClickHouse overview and academic architecture overview
- MergeTree and MergeTree engine family
- Creating tables
- Choosing a primary key
- Practical sparse-primary-index guide
- Choosing a partitioning key
- Part merges
- Bulk inserts and selecting an insert strategy
- Asynchronous inserts
- Deduplicating inserts on retries
- Data-skipping indexes and examples
- PREWHERE and query optimization
- Query parallelism
- Materialized views, cascading views and refreshable views
- Projections
- ReplacingMergeTree and updating-data overview
- Lightweight DELETE and lightweight UPDATE
- Mutations and TTL
- ReplicatedMergeTree and ClickHouse Keeper
- Shards, replicas and Distributed table engine
- Horizontal scaling and SharedMergeTree
- Kafka and CDC integrations
- Dictionaries and JOIN best practices
- Backups, system tables and workload management

VERSION-SENSITIVE NOTES

- Lightweight UPDATE and patch-part behavior are evolving; verify the exact server version.
- ClickHouse Cloud uses SharedMergeTree-family engines and differs from self-managed ReplicatedMergeTree and Distributed-engine deployments.
- Query caches, condition caches, projections and optimizer behavior can change between releases.
- Insert-deduplication windows and acknowledgement behavior depend on table engine and settings.
- QPS, latency, compression and rows-per-second figures in this guide are interview assumptions, not ClickHouse guarantees.
-->
