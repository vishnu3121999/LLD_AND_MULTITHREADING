---
title: PostgreSQL
slug: postgres
summary: Interview-focused guide to PostgreSQL architecture, relational modelling, MVCC, WAL, transactions, indexes, query planning, vacuum, replication, partitioning, reliability, and capacity planning.
tags:
  - database
  - sql
  - relational-database
  - postgresql
difficulty: intermediate
---

# PostgreSQL

PostgreSQL is an open-source relational database designed for correctness, durable transactions, rich SQL, extensibility and operational reliability.

It is commonly used for:

- Transactional systems of record.
- Users, orders, payments and inventory.
- Booking and reservation systems.
- SaaS application metadata.
- Job and workflow state.
- Configuration and access control.
- Geospatial applications through PostGIS.
- JSON/document-style application data.
- Moderate full-text search.
- Change-data-capture sources.

> **One-line interview definition:** PostgreSQL is a durable relational database that provides ACID transactions, MVCC, constraints, mature indexes, rich SQL, write-ahead logging, replication and extensibility.

For many HLD problems, PostgreSQL should be the default starting point. Use specialized systems only when a demonstrated workload requires a cache, search engine, analytical database, distributed event store or horizontally partitioned database.


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL in an HLD architecture
What to use: Applications connect through a pool to a PostgreSQL primary, with read replicas, WAL archive, backup storage and CDC consumers.
Preferred source: PostgreSQL official architecture, replication, WAL and logical-replication documentation.
Search terms: site:postgresql.org/docs PostgreSQL primary replica WAL archive logical replication architecture
Purpose: Introduce PostgreSQL as the transactional source of truth.
Alt text: Applications use pooled connections to a PostgreSQL primary while WAL feeds replicas, backups and CDC.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# 1. When to Use PostgreSQL

Choose PostgreSQL when:

- Transactions span multiple rows or tables.
- Relationships and joins matter.
- Constraints must protect business invariants.
- Queries may evolve after the initial design.
- Updates and deletes are common.
- Strong read-after-write behavior is expected.
- One primary with replicas can satisfy write throughput.
- Operational simplicity matters.

Typical systems:

- E-commerce.
- Payments and ledgers.
- Inventory.
- Reservations.
- User accounts.
- Subscription billing.
- Job schedulers.
- Multi-tenant SaaS.
- Content-management systems.
- Workflow metadata.

# 2. When PostgreSQL Is Not Enough Alone

Use complementary systems when the workload is dominated by:

| Requirement | Better or complementary system |
|---|---|
| Sub-millisecond cache, sessions or rate limiting | Redis |
| Search relevance, fuzzy text and autocomplete | Elasticsearch/OpenSearch |
| Broad scans and large aggregations | ClickHouse or a warehouse |
| Durable event streaming and replay | Kafka |
| Extremely high partitioned writes | Cassandra |
| Large media files | Object storage |
| Low-latency multi-region active-active writes | Distributed SQL or ownership-based sharding |

# 3. Scaling Progression

Scale PostgreSQL in this order:

```text
1. Correct schema and constraints.
2. Fix query plans and indexes.
3. Use connection pooling.
4. Add caching where useful.
5. Add read replicas.
6. Partition lifecycle-heavy tables.
7. Move search and analytics out.
8. Shard only after proving one-primary limits.
```


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL scaling ladder
What to use: A staircase from schema/index tuning to pooling, caching, replicas, partitioning, workload separation and sharding.
Preferred source: Create an original diagram from PostgreSQL official performance, replication and partitioning docs.
Search terms: PostgreSQL scaling ladder pooling replicas partitioning sharding
Purpose: Prevent premature sharding.
Alt text: PostgreSQL usually scales through tuning and replicas before partitioning or sharding.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# PostgreSQL Architecture

## 4. Server Process Model

A PostgreSQL installation contains:

- **Postmaster:** Accepts connections and supervises processes.
- **Backend process:** Handles one client connection.
- **Shared buffers:** PostgreSQL-managed page cache.
- **WAL buffers:** Staging area for write-ahead records.
- **Checkpointer:** Coordinates checkpoints.
- **Background writer:** Gradually writes dirty pages.
- **WAL writer:** Flushes WAL buffers.
- **Autovacuum launcher/workers:** Vacuum and analyze tables.
- **Archiver:** Copies completed WAL segments.
- **Walsender/walreceiver:** Stream WAL to replicas.
- **Logical replication workers:** Apply publication changes.

PostgreSQL traditionally uses one backend process per client connection. This provides isolation but means thousands of direct application connections are expensive.

## 5. Shared Buffers and OS Cache

PostgreSQL reads table and index pages into shared buffers. The operating system also caches file pages.

Memory is needed for:

- Shared buffers.
- OS page cache.
- Backend processes.
- Sorts and hash tables.
- Autovacuum.
- WAL.
- Connection pool.
- Maintenance.
- Extensions.

Do not allocate all host RAM to `shared_buffers`.

## 6. Database, Schema and Relation

Hierarchy:

```text
PostgreSQL cluster
  -> database
      -> schema
          -> table / index / view / sequence / function
```

A connection normally targets one database. Schemas provide namespacing inside it.


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL process architecture
What to use: Postmaster, client backends, shared buffers, WAL buffers and background processes.
Preferred source: PostgreSQL official server architecture documentation.
Search terms: site:postgresql.org/docs PostgreSQL postmaster backend shared buffers checkpointer WAL writer
Purpose: Explain PostgreSQL's process-per-connection architecture.
Alt text: PostgreSQL backends share memory and coordinate with WAL, checkpoint and vacuum background processes.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL memory hierarchy
What to use: Backend query memory, shared buffers, OS page cache and durable storage.
Preferred source: PostgreSQL official resource-consumption documentation.
Search terms: site:postgresql.org/docs PostgreSQL shared_buffers OS cache work_mem
Purpose: Explain why the complete dataset need not fit in shared buffers.
Alt text: PostgreSQL uses private query memory, shared buffers and the operating-system page cache.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Relational Data Modelling

## 7. Primary Keys

A primary key provides:

- Unique row identity.
- Non-null guarantee.
- A unique index.
- A target for foreign keys.

Common choices:

- `BIGINT GENERATED ... AS IDENTITY`.
- UUID.
- Natural key.
- Composite key.

Sequence/identity values can contain gaps and do not prove commit order.

## 8. UUID Trade-Off

Advantages:

- Can be generated independently.
- Useful across distributed producers.
- Harder to enumerate.

Trade-offs:

- Larger table and index entries.
- Random values reduce B-tree locality.
- More memory and cache pressure.

Time-ordered UUID support is version/library-sensitive and should be verified for the deployed version.

## 9. Foreign Keys

```sql
CREATE TABLE orders
(
    order_id BIGINT PRIMARY KEY,
    user_id  BIGINT NOT NULL REFERENCES users(user_id)
);
```

Foreign keys prevent orphan rows.

PostgreSQL does not automatically create an index on the referencing column. Add one when parent deletes/updates or child lookups require it.

## 10. Unique Constraints

Use unique constraints for:

- Email.
- External order ID.
- Idempotency keys.
- Alternate identifiers.
- Deduplication.

Do not use:

```text
SELECT whether value exists
then INSERT
```

because concurrent transactions can both pass the check.

## 11. Check and Exclusion Constraints

Check:

```sql
CHECK (amount >= 0)
```

Exclusion constraints can prevent overlapping ranges, useful for reservation intervals.

## 12. Normalization and Denormalization

Normalize transactional data to avoid inconsistent duplicates.

Denormalize selectively for:

- Historical snapshots.
- Read-heavy projections.
- Avoiding repeated expensive joins.
- Reporting tables.

## 13. JSONB

Use JSONB for flexible row-owned attributes.

Keep frequently queried, joined and constrained fields as typed columns.

Avoid putting an entire relational domain into one JSON document by default.


<!-- IMAGE PLACEHOLDER
Title: Normalized e-commerce schema
What to use: Users, orders, order items, products and payments connected by keys.
Preferred source: Create an original ER diagram based on PostgreSQL relational modelling.
Search terms: PostgreSQL normalized ecommerce schema foreign keys
Purpose: Show how relational responsibilities are separated.
Alt text: A normalized PostgreSQL schema links users, orders, line items, products and payments.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: JSONB hybrid schema
What to use: Typed relational columns plus a JSONB attributes column with selected GIN/expression indexes.
Preferred source: PostgreSQL official JSON and JSONB indexing documentation.
Search terms: site:postgresql.org/docs PostgreSQL JSONB GIN expression index
Purpose: Show relational and document modelling together.
Alt text: Frequently queried values use typed columns while flexible attributes use JSONB.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Physical Storage

## 14. Heap Tables and Pages

PostgreSQL tables are normally heaps: rows are not kept in primary-key order.

Relations are stored in fixed-size pages, commonly 8 KB.

A heap page contains:

- Page header.
- Line pointers.
- Tuple versions.
- Free space.

## 15. Heap Tuple

A tuple contains:

- Column data.
- Null bitmap.
- Alignment.
- MVCC transaction metadata.
- Physical tuple header.

## 16. CTID

`ctid` identifies a physical tuple location:

```text
(block number, item position)
```

It can change after updates and rewrites. Never use it as a permanent application ID.

## 17. TOAST

Large values may be compressed and stored out of line in a TOAST table.

Applies to values such as:

- Large `TEXT`.
- `BYTEA`.
- JSONB.
- Arrays.

Large media should normally live in object storage.

## 18. Free Space and Visibility Maps

The free-space map tracks pages with room for inserts/updates.

The visibility map tracks pages that are all-visible or all-frozen. It helps vacuum and index-only scans.

## 19. Fillfactor

A lower table fillfactor leaves room for future tuple versions on the same page.

Useful for update-heavy tables and HOT updates.

Trade-off: more storage and fewer rows per page.


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL heap page layout
What to use: An 8 KB page showing header, line pointers, tuples and free space.
Preferred source: PostgreSQL official storage-page-layout documentation.
Search terms: site:postgresql.org/docs PostgreSQL heap page layout
Purpose: Explain the physical unit used by scans and updates.
Alt text: A PostgreSQL heap page contains line pointers, tuple versions and free space.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: B-tree lookup to heap tuple
What to use: Index traversal returns a tuple identifier, then PostgreSQL reads the heap page and checks MVCC visibility.
Preferred source: PostgreSQL index and MVCC documentation.
Search terms: site:postgresql.org/docs PostgreSQL index heap tuple visibility
Purpose: Explain why an index lookup may still need a table page.
Alt text: A PostgreSQL index points to a heap tuple whose visibility must be checked.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: TOAST storage
What to use: Large JSONB or text compressed and chunked in a separate TOAST relation.
Preferred source: PostgreSQL official TOAST documentation.
Search terms: site:postgresql.org/docs PostgreSQL TOAST diagram
Purpose: Explain out-of-line values.
Alt text: PostgreSQL stores large values in compressed chunks outside the main heap row.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# MVCC and Isolation

## 20. Multi-Version Concurrency Control

MVCC lets readers and writers proceed concurrently.

An update creates a new tuple version. Older transactions can continue to see the old committed version while newer transactions see the new one.

Readers generally do not block writers, but conflicting writers can block one another.

## 21. Snapshots

A snapshot defines which transaction IDs are visible to a statement or transaction.

Tuple metadata is checked against the snapshot to determine whether a version is visible.

## 22. Read Committed

Default level.

Each statement receives a new snapshot.

Protects against dirty reads but allows:

- Non-repeatable reads.
- Phantoms.
- Application lost-update patterns.

## 23. Repeatable Read

Uses a stable transaction snapshot.

Repeated queries see the same snapshot. Conflicting concurrent updates may cause transaction failure.

## 24. Serializable

PostgreSQL uses Serializable Snapshot Isolation to detect dangerous dependency structures.

Transactions may abort with serialization failure. Retry the entire transaction.

Serializable does not mean that transactions literally run one by one.

## 25. Lost Update

Unsafe:

```text
A reads 100
B reads 100
A writes 90
B writes 80
```

Safer:

```sql
UPDATE accounts
SET balance = balance - ?
WHERE account_id = ?
  AND balance >= ?;
```

Check affected row count.

## 26. Write Skew

Transactions read a shared invariant and update different rows, allowing both to commit incorrectly.

Prevent with:

- Serializable.
- Shared invariant row lock.
- Constraint redesign.
- Advisory lock.

## 27. Long Transactions

Long or idle transactions retain old snapshots and can cause:

- Dead-tuple accumulation.
- Vacuum delay.
- Bloat.
- Standby conflicts.
- Transaction-ID wraparound pressure.

## 28. Transaction ID Freezing

Transaction IDs are finite. Vacuum freezes old tuple metadata so visibility remains safe across wraparound.


<!-- IMAGE PLACEHOLDER
Title: MVCC version timeline
What to use: A row updated from V1 to V2 while old and new snapshots see different versions.
Preferred source: PostgreSQL official MVCC documentation.
Search terms: site:postgresql.org/docs PostgreSQL MVCC tuple version snapshot
Purpose: Make snapshot visibility intuitive.
Alt text: PostgreSQL retains multiple row versions so transactions see the correct committed state.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Isolation anomaly matrix
What to use: Dirty reads, non-repeatable reads, phantoms and serialization failures by isolation level.
Preferred source: PostgreSQL official transaction-isolation documentation.
Search terms: site:postgresql.org/docs PostgreSQL transaction isolation table
Purpose: Help choose isolation by correctness need.
Alt text: PostgreSQL isolation levels prevent progressively more concurrency anomalies.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Long transaction blocks vacuum
What to use: Old snapshot remains active while updates create dead versions that vacuum cannot remove.
Preferred source: PostgreSQL routine-vacuuming documentation.
Search terms: site:postgresql.org/docs PostgreSQL long transaction vacuum
Purpose: Show why idle transactions are dangerous.
Alt text: A long-running PostgreSQL snapshot prevents vacuum from reclaiming obsolete tuples.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Locks and Concurrency

## 29. Row Locks

```sql
SELECT *
FROM inventory
WHERE product_id = ?
FOR UPDATE;
```

Variants:

- `FOR UPDATE`.
- `FOR NO KEY UPDATE`.
- `FOR SHARE`.
- `FOR KEY SHARE`.

Choose the weakest lock that protects the invariant.

## 30. Optimistic Concurrency

```sql
UPDATE documents
SET content = ?,
    version = version + 1
WHERE document_id = ?
  AND version = ?;
```

Zero affected rows means conflict.

## 31. `SKIP LOCKED`

Workers can claim independent jobs:

```sql
SELECT job_id
FROM jobs
WHERE status = 'READY'
ORDER BY priority DESC, created_at
FOR UPDATE SKIP LOCKED
LIMIT 10;
```

Useful for moderate database-backed queues.

## 32. Advisory Locks

Use application-defined lock keys for rare coordination.

Prefer transaction-scoped advisory locks so pooled connections cannot accidentally retain session locks.

## 33. Deadlocks

PostgreSQL detects cycles and aborts one transaction.

Reduce them by:

- Locking rows in consistent order.
- Keeping transactions short.
- Avoiding external calls inside transactions.
- Retrying deadlock victims.

## 34. Lock and Statement Timeouts

Use bounded:

- `lock_timeout`.
- `statement_timeout`.
- `idle_in_transaction_session_timeout`.

Timeout values must align with retry and user-latency requirements.


<!-- IMAGE PLACEHOLDER
Title: SKIP LOCKED workers
What to use: Several workers claim different ready jobs while skipping already locked rows.
Preferred source: PostgreSQL official SELECT locking-clause documentation.
Search terms: site:postgresql.org/docs PostgreSQL FOR UPDATE SKIP LOCKED
Purpose: Show a database-backed worker recipe.
Alt text: PostgreSQL workers use SKIP LOCKED to claim separate jobs concurrently.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Deadlock cycle
What to use: Transaction A holds row 1 and waits for row 2 while B holds row 2 and waits for row 1.
Preferred source: PostgreSQL explicit-locking documentation.
Search terms: site:postgresql.org/docs PostgreSQL deadlock diagram
Purpose: Explain deadlock detection and retry.
Alt text: PostgreSQL aborts one transaction when it detects a circular lock wait.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Transactions and External Side Effects

## 35. ACID

- **Atomicity:** All changes commit or roll back.
- **Consistency:** Constraints and transaction logic preserve invariants.
- **Isolation:** Concurrent transactions follow the chosen isolation level.
- **Durability:** Committed WAL protects changes across crashes.

## 36. Keep Transactions Short

Avoid:

```text
BEGIN
lock rows
call external service
wait 30 seconds
COMMIT
```

Remote calls extend lock and snapshot lifetime.

## 37. Savepoints

Savepoints allow partial rollback inside a transaction.

## 38. Transactional Outbox

Commit business state and an outbox row together:

```sql
BEGIN;

UPDATE orders
SET status = 'PAID'
WHERE order_id = ?;

INSERT INTO outbox_events (...);

COMMIT;
```

A publisher sends the event later and must be idempotent.

## 39. Idempotent Inbox

A consumer records a unique event ID in the same transaction as applying business state.

## 40. Two-Phase Commit

PostgreSQL supports prepared transactions, but distributed 2PC adds:

- Coordinator dependency.
- Prepared-transaction cleanup.
- Lock retention.
- Operational complexity.

Use only when required and supported end to end.


<!-- IMAGE PLACEHOLDER
Title: Transactional outbox
What to use: Business update and outbox insert commit together; a publisher later sends to Kafka.
Preferred source: Create an original diagram based on PostgreSQL transactions.
Search terms: PostgreSQL transactional outbox Kafka
Purpose: Show reliable event publication.
Alt text: PostgreSQL commits business state and an outbox record atomically before asynchronous publishing.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# WAL, Checkpoints and Recovery

## 41. Write-Ahead Log

WAL is an append-oriented stream of database change records.

It supports:

- Crash recovery.
- Physical replication.
- Point-in-time recovery.
- Logical decoding.
- Online backup.

## 42. Commit Path

Simplified:

1. Backend changes pages in shared buffers.
2. WAL records are generated.
3. Commit record is flushed according to durability settings.
4. Client receives success.
5. Dirty data pages are written later.

The WAL must be durable before corresponding data pages.

## 43. Checkpoints

A checkpoint flushes required dirty pages and creates a recovery starting point.

Frequent checkpoints:

- Increase write pressure.
- Increase full-page-image overhead.
- Shorten replay distance.

Infrequent checkpoints:

- Need more WAL.
- Can increase crash-recovery time.

## 44. Full-Page Images

The first page modification after a checkpoint can log a full page image to protect against torn writes.

## 45. `synchronous_commit`

Relaxing it can reduce latency by acknowledging before local WAL flush, accepting a recent-loss window during crash.

Atomicity remains; durability changes.

## 46. Crash Recovery

After an unclean shutdown, PostgreSQL replays WAL from a checkpoint until a consistent state is restored.

## 47. Unlogged Tables

Unlogged table data is not fully WAL protected and is cleared after crash recovery.

Use only for rebuildable staging or derived data.


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL commit path
What to use: Shared-buffer update, WAL generation, WAL flush, acknowledgement, later data-page write.
Preferred source: PostgreSQL official WAL documentation.
Search terms: site:postgresql.org/docs PostgreSQL WAL commit path
Purpose: Explain durable commit without synchronous heap writes.
Alt text: PostgreSQL acknowledges a commit after WAL durability while table pages can be written later.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Checkpoint and crash recovery
What to use: Dirty pages, checkpoint record, later WAL, crash and replay.
Preferred source: PostgreSQL official checkpoint and recovery documentation.
Search terms: site:postgresql.org/docs PostgreSQL checkpoint crash recovery diagram
Purpose: Show the recovery trade-off.
Alt text: PostgreSQL replays WAL after the last checkpoint to recover committed changes.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Vacuum and Bloat

## 48. Why Vacuum Exists

Updates and deletes leave obsolete tuple versions.

Vacuum:

- Makes dead tuple space reusable.
- Removes dead index references where possible.
- Updates visibility information.
- Freezes old transaction IDs.
- Prevents wraparound.
- Enables efficient index-only scans.

## 49. Autovacuum

Autovacuum runs `VACUUM` and `ANALYZE` based on table changes and transaction age.

Large or hot tables often need per-table tuning.

## 50. HOT Update

A Heap-Only Tuple update can avoid new index entries when:

- Indexed columns do not change.
- New tuple version fits on the same page.

Lower fillfactor can improve HOT rate.

## 51. Bloat

Bloat comes from update/delete churn, long transactions and insufficient vacuum.

Effects:

- More pages.
- Larger indexes.
- Worse cache efficiency.
- Slower queries and maintenance.

## 52. `VACUUM FULL`

Rewrites a table and returns space to the OS.

Trade-offs:

- Strong lock.
- Extra disk.
- Expensive rewrite.

Not a routine replacement for autovacuum.

## 53. Analyze

`ANALYZE` updates planner statistics.

Bad statistics can produce wrong scan, join and aggregation plans.


<!-- IMAGE PLACEHOLDER
Title: Vacuum lifecycle
What to use: Update creates new tuple; old tuple becomes dead; vacuum marks space reusable and visibility map all-visible.
Preferred source: PostgreSQL routine-vacuuming documentation.
Search terms: site:postgresql.org/docs PostgreSQL vacuum lifecycle
Purpose: Explain MVCC cleanup.
Alt text: PostgreSQL vacuum reclaims obsolete row versions after snapshots no longer need them.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: HOT update
What to use: Old and new tuple versions on one page with an index still pointing to the HOT chain root.
Preferred source: PostgreSQL storage and HOT documentation.
Search terms: site:postgresql.org/docs PostgreSQL HOT update
Purpose: Show reduced index write amplification.
Alt text: A PostgreSQL HOT update creates a same-page version without adding new index entries.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Autovacuum threshold
What to use: Dead tuples rise above fixed-plus-scale threshold and fall after autovacuum.
Preferred source: PostgreSQL autovacuum documentation.
Search terms: site:postgresql.org/docs PostgreSQL autovacuum threshold scale factor
Purpose: Explain why large tables often need custom settings.
Alt text: PostgreSQL starts autovacuum when table changes cross configured thresholds.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Indexes

## 54. Index Cost

Indexes improve selected reads but add:

- Insert/update/delete cost.
- WAL.
- Storage.
- Vacuum work.
- Replica bandwidth.
- Cache pressure.

Index query patterns, not every column.

## 55. B-Tree

Best for:

- Equality.
- Range.
- Ordering.
- Unique constraints.
- Min/max.

## 56. Multicolumn Index

Index `(tenant_id, status, created_at DESC)` strongly supports:

```sql
WHERE tenant_id = ?
  AND status = ?
  AND created_at >= ?
ORDER BY created_at DESC;
```

A common rule is:

```text
equality columns
then range/order column
```

## 57. Covering Index

```sql
CREATE INDEX orders_user_time_idx
ON orders (user_id, created_at DESC)
INCLUDE (status, amount);
```

Included columns can support index-only scans.

## 58. Partial Index

```sql
CREATE INDEX jobs_ready_idx
ON jobs (priority DESC, scheduled_at)
WHERE status = 'READY';
```

Smaller and cheaper than indexing every row.

## 59. Expression Index

```sql
CREATE UNIQUE INDEX users_email_lower_uq
ON users (lower(email));
```

## 60. GIN

Useful for:

- JSONB containment.
- Arrays.
- Full-text search.
- Trigrams through extensions.

Higher storage/write cost than a simple B-tree.

## 61. GiST

Useful for:

- Ranges.
- Geometry.
- Nearest neighbor.
- Exclusion constraints.
- PostGIS.

## 62. SP-GiST

Useful for partitioned search structures such as tries and selected geometric data.

## 63. BRIN

Stores summaries for page ranges.

Excellent for physically correlated large tables, such as append-only timestamps.

Very small but coarse.

## 64. Hash

Equality-only index. B-tree remains the common default unless hash-specific benefits are measured.

## 65. Index-Only Scan

Possible when all required columns are in the index and the visibility map proves rows visible.

## 66. Bitmap Scan

Combines matching index entries into heap-page bitmaps and can combine multiple indexes.

## 67. Concurrent Index Build

`CREATE INDEX CONCURRENTLY` reduces write blocking but takes longer and can leave an invalid index after failure.


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL index decision tree
What to use: Choose B-tree, GIN, GiST, SP-GiST, BRIN or hash by query operator and data shape.
Preferred source: PostgreSQL official index-types documentation.
Search terms: site:postgresql.org/docs PostgreSQL index types
Purpose: Provide a reusable index-selection visual.
Alt text: PostgreSQL index types specialize in ordering, containment, geometry and page-range summaries.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Multicolumn B-tree prefix
What to use: Lexicographic index on tenant/status/time with highlighted matching ranges.
Preferred source: PostgreSQL multicolumn-index documentation.
Search terms: site:postgresql.org/docs PostgreSQL multicolumn B-tree leading columns
Purpose: Show why index column order matters.
Alt text: A PostgreSQL multicolumn B-tree narrows most efficiently through leading columns.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Partial index
What to use: Only READY jobs from a large table represented in a compact index.
Preferred source: PostgreSQL partial-index documentation.
Search terms: site:postgresql.org/docs PostgreSQL partial index
Purpose: Show selective index maintenance.
Alt text: A PostgreSQL partial index includes only rows satisfying its predicate.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: BRIN block summaries
What to use: Time-ordered heap pages summarized by minimum and maximum timestamps.
Preferred source: PostgreSQL BRIN documentation.
Search terms: site:postgresql.org/docs PostgreSQL BRIN minmax block ranges
Purpose: Explain BRIN size and correlation dependence.
Alt text: A PostgreSQL BRIN index skips page ranges whose summaries cannot match.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: GIN inverted index
What to use: JSONB keys or text tokens pointing to matching tuple identifiers.
Preferred source: PostgreSQL GIN and JSONB documentation.
Search terms: site:postgresql.org/docs PostgreSQL GIN inverted index
Purpose: Explain multi-valued indexing.
Alt text: A PostgreSQL GIN index maps component values to rows containing them.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Query Planner and Execution

## 68. Cost-Based Planner

PostgreSQL estimates the cost of possible plans using:

- Row counts.
- Value distribution.
- Distinct estimates.
- Correlation.
- Page costs.
- CPU costs.
- Memory.
- Join alternatives.
- Parallelism.

The cheapest estimated plan wins.

## 69. Sequential Scan

Can be best when:

- Many rows match.
- Table is small.
- Data is cached.
- Index lookups would cause many heap reads.

An available index is not automatically faster.

## 70. Index and Bitmap Scans

Index scan is best for selective access.

Bitmap heap scan is useful for medium selectivity or combining indexes.

## 71. Join Algorithms

- **Nested loop:** Small outer input and indexed inner lookup.
- **Hash join:** Equality join over larger unsorted inputs.
- **Merge join:** Ordered inputs and equality/range-compatible processing.

## 72. Sort and `work_mem`

Sorts and hashes can spill to disk.

`work_mem` applies per operation and often per parallel worker, not once per database.

## 73. Statistics

Planner statistics include:

- Null fraction.
- Distinct count.
- Most common values.
- Histogram.
- Correlation.

## 74. Extended Statistics

Useful for correlated columns and distinct combinations.

## 75. Prepared Statements

PostgreSQL may choose a custom or generic plan.

Skewed tenant sizes can make a generic plan poor for some parameters.

## 76. EXPLAIN

Use:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT ...;
```

Inspect:

- Actual vs estimated rows.
- Loops.
- Timing.
- Buffer hits/reads.
- Sort method.
- Disk spill.
- Heap fetches.
- Parallel workers.

## 77. `pg_stat_statements`

Find queries by total system cost, not only the single slowest execution.


<!-- IMAGE PLACEHOLDER
Title: Planner access-path choice
What to use: One query branching to sequential, index and bitmap scans with estimated costs.
Preferred source: PostgreSQL planner and EXPLAIN documentation.
Search terms: site:postgresql.org/docs PostgreSQL planner scan choices
Purpose: Explain why PostgreSQL sometimes ignores indexes.
Alt text: PostgreSQL chooses between sequential, index and bitmap scans using estimated cost.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Join algorithm comparison
What to use: Nested loop, hash join and merge join side by side.
Preferred source: PostgreSQL planner documentation.
Search terms: site:postgresql.org/docs PostgreSQL nested loop hash merge join
Purpose: Make join selection intuitive.
Alt text: PostgreSQL selects join algorithms based on input size, equality and ordering.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: EXPLAIN ANALYZE anatomy
What to use: Annotated node with estimates, actual rows, loops, time and buffers.
Preferred source: PostgreSQL EXPLAIN documentation.
Search terms: site:postgresql.org/docs PostgreSQL EXPLAIN ANALYZE BUFFERS
Purpose: Teach plan reading.
Alt text: PostgreSQL EXPLAIN ANALYZE compares estimated and actual execution behavior.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: work_mem multiplication
What to use: Concurrent queries with multiple sort/hash nodes and parallel workers each using memory.
Preferred source: PostgreSQL resource-consumption documentation.
Search terms: site:postgresql.org/docs PostgreSQL work_mem per operation
Purpose: Prevent unsafe memory tuning.
Alt text: PostgreSQL can allocate work_mem to several operators and workers in every active query.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Partitioning

## 78. Declarative Partitioning

Methods:

- Range.
- List.
- Hash.

Example:

```sql
CREATE TABLE events
(
    event_time TIMESTAMPTZ NOT NULL,
    tenant_id  BIGINT NOT NULL,
    payload    JSONB
)
PARTITION BY RANGE (event_time);
```

## 79. When to Partition

Use for:

- Large time-retained tables.
- Fast detach/drop.
- Partition pruning.
- Maintenance isolation.
- Different storage/index policies.

Do not partition merely because a table has millions of rows.

## 80. Partition Pruning

A query with a partition-key predicate skips unrelated partitions.

## 81. Partitioning Is Not Sharding

Partitioning divides one logical table inside one PostgreSQL cluster.

Sharding distributes data across independent servers.

## 82. Unique Constraints

A unique/primary constraint on a partitioned table generally needs all partition-key columns.

## 83. Too Many Partitions

Excessive partitions increase:

- Planning.
- Catalog size.
- Autovacuum objects.
- Index count.
- Operational complexity.

Choose partition interval based on lifecycle and size.

## 84. Retention

Detaching/dropping an old partition is far cheaper than deleting every row individually.


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL time partitioning
What to use: Parent events table with monthly partitions and pruning for one month.
Preferred source: PostgreSQL declarative-partitioning documentation.
Search terms: site:postgresql.org/docs PostgreSQL partition pruning
Purpose: Show routing and pruning.
Alt text: PostgreSQL routes rows into time partitions and skips unrelated partitions during queries.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Partitioning vs sharding
What to use: Child tables on one server contrasted with shard groups on separate servers.
Preferred source: PostgreSQL partitioning docs plus an original comparison.
Search terms: PostgreSQL partitioning versus sharding
Purpose: Prevent conceptual confusion.
Alt text: PostgreSQL partitioning is local to one cluster while sharding distributes data across servers.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Partition lifecycle
What to use: Create future partition, active writes, detach, archive and drop.
Preferred source: PostgreSQL partition-maintenance documentation.
Search terms: site:postgresql.org/docs PostgreSQL detach drop partition
Purpose: Show retention operations.
Alt text: PostgreSQL time partitions progress from active ingestion to archival and deletion.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Write Patterns

## 85. Bulk Loading

Use multi-row inserts or `COPY` for large loads.

Consider:

- Indexes.
- Constraints.
- Triggers.
- WAL.
- Replication.
- Error handling.

## 86. Upsert

```sql
INSERT INTO idempotency_keys (...)
VALUES (...)
ON CONFLICT (...) DO NOTHING;
```

Use a unique constraint as the concurrency boundary.

## 87. MERGE

Useful for conditional set-based insert/update/delete behavior.

Concurrency and uniqueness semantics must still be understood.

## 88. Updates

An update writes a new tuple version and may update every affected index.

## 89. Deletes

Deletes create dead tuples that vacuum later reclaims.

For large time-based retention, use partition drop.

## 90. Compare-and-Set

```sql
UPDATE orders
SET status = 'PAID',
    version = version + 1
WHERE order_id = ?
  AND status = 'PENDING'
  AND version = ?;
```

## 91. Soft Delete

A `deleted_at` column requires:

- Every query to filter.
- Partial indexes.
- Clear uniqueness semantics.
- Eventual cleanup if data should not grow forever.


<!-- IMAGE PLACEHOLDER
Title: Upsert concurrency
What to use: Two clients insert the same unique key and PostgreSQL's unique index resolves ON CONFLICT.
Preferred source: PostgreSQL INSERT ON CONFLICT documentation.
Search terms: site:postgresql.org/docs PostgreSQL ON CONFLICT concurrency
Purpose: Show safe idempotency.
Alt text: A PostgreSQL unique index serializes concurrent inserts for the same business key.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Delete vs partition drop
What to use: Row-by-row delete creates dead tuples and WAL, while partition drop removes one lifecycle unit.
Preferred source: PostgreSQL partitioning and vacuum documentation.
Search terms: PostgreSQL delete versus drop partition
Purpose: Show efficient retention.
Alt text: Dropping a PostgreSQL partition avoids millions of row delete versions.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Physical Replication and High Availability

## 92. Streaming Replication

The primary generates WAL. Standbys receive and replay it.

Physical replication copies the complete PostgreSQL cluster at the storage-change level.

## 93. Asynchronous Replication

Primary does not wait for standby.

Advantages:

- Low write latency.
- Primary remains writable if standby is unavailable.

Risk:

- Recent acknowledged writes may be lost after primary failure.

## 94. Synchronous Replication

Primary waits for configured standby acknowledgement.

Advantages:

- Lower failover-loss risk.
- Optional remote visibility guarantees.

Trade-offs:

- Higher latency.
- Write availability depends on synchronous standbys.

## 95. Replica Reads

Hot standbys can serve read-only queries.

Limitations:

- Staleness.
- Read-after-write not guaranteed.
- Long queries can conflict with WAL replay.
- Heavy reporting can slow recovery.

## 96. Replication Lag

Measure receive, flush and replay lag in bytes/time.

## 97. Replication Slots

Slots retain required WAL.

An abandoned slot can fill disk.

## 98. Failover

Safe failover requires:

1. Failure detection.
2. Authoritative promotion decision.
3. Old-primary fencing.
4. Standby promotion.
5. Client rerouting.
6. Reconfiguration of remaining standbys.
7. Rewind/rebuild of old primary.

PostgreSQL provides replication primitives; orchestration is separate.

## 99. Split Brain

Two writable primaries cause divergence.

Use quorum-aware orchestration and fencing.

## 100. Standby Conflicts

Long standby queries can conflict with primary vacuum cleanup.

`hot_standby_feedback` reduces cancellation but can increase primary bloat.


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL streaming replication
What to use: Primary walsender streams WAL to two standby walreceivers that flush and replay it.
Preferred source: PostgreSQL streaming-replication documentation.
Search terms: site:postgresql.org/docs PostgreSQL streaming replication
Purpose: Explain physical replication.
Alt text: A PostgreSQL primary streams WAL to standbys that replay changes and serve selected reads.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Async vs synchronous replication
What to use: Two commit timelines: immediate primary acknowledgement and waiting for standby flush.
Preferred source: PostgreSQL synchronous-replication documentation.
Search terms: site:postgresql.org/docs PostgreSQL sync async replication
Purpose: Show latency and loss trade-offs.
Alt text: Asynchronous commits return earlier while synchronous commits wait for replica acknowledgement.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL failover
What to use: Primary failure, controller decision, fencing, promotion and client rerouting.
Preferred source: PostgreSQL high-availability documentation.
Search terms: PostgreSQL failover fencing split brain
Purpose: Show that replication alone is not automatic safe failover.
Alt text: A failover controller fences the old PostgreSQL primary before promoting a standby.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Standby query conflict
What to use: Long replica query needs old tuples while incoming WAL contains vacuum cleanup.
Preferred source: PostgreSQL hot-standby documentation.
Search terms: site:postgresql.org/docs PostgreSQL recovery conflict vacuum
Purpose: Explain read-replica cancellation.
Alt text: A PostgreSQL standby may cancel an old snapshot so WAL replay can continue.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Logical Replication and CDC

## 101. Architecture

```text
publisher
  -> publication
  -> logical decoding / walsender
  -> subscriber apply worker
```

Logical replication sends selected table changes rather than storage blocks.

## 102. Publication and Subscription

```sql
CREATE PUBLICATION app_pub
FOR TABLE users, orders;
```

```sql
CREATE SUBSCRIPTION app_sub
CONNECTION '...'
PUBLICATION app_pub;
```

## 103. Replica Identity

Updates/deletes require a key, normally the primary key.

Without one, `REPLICA IDENTITY FULL` can send more row data and cost more.

## 104. Uses

- CDC to Kafka.
- Analytics.
- Cross-version migration.
- Selective replication.
- Read-model construction.
- Database consolidation.

## 105. Logical Slot

A slot retains WAL until the consumer confirms progress.

Monitor lag and disk.

## 106. DDL and Sequences

Core logical replication does not generally reproduce all schema changes automatically, and normal sequence state needs migration planning.

## 107. Delivery

Downstream CDC processing should be idempotent and ordered per business entity.


<!-- IMAGE PLACEHOLDER
Title: Logical replication architecture
What to use: Publication, logical slot, walsender and subscriber apply worker.
Preferred source: PostgreSQL logical-replication documentation.
Search terms: site:postgresql.org/docs PostgreSQL logical replication architecture
Purpose: Contrast table-level CDC with physical replication.
Alt text: PostgreSQL logical replication sends selected row changes to subscriber tables.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Physical vs logical replication
What to use: Full-cluster storage replication compared with selected row-level table changes.
Preferred source: PostgreSQL comparison-of-replication-solutions documentation.
Search terms: site:postgresql.org/docs PostgreSQL physical logical replication
Purpose: Help choose a replication mechanism.
Alt text: Physical replication copies the whole cluster while logical replication copies selected table changes.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Replication slot disk growth
What to use: Stopped consumer holds restart LSN while WAL accumulates in pg_wal.
Preferred source: PostgreSQL replication-slot documentation.
Search terms: site:postgresql.org/docs PostgreSQL replication slot disk full
Purpose: Show an important operational risk.
Alt text: A stalled PostgreSQL replication slot prevents old WAL from being removed.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Backups and PITR

## 108. Logical Backup

`pg_dump` and `pg_restore` support object-level and portable backup/restore.

Good for:

- Selected schemas/tables.
- Migrations.
- Smaller databases.

## 109. Physical Backup

A base backup plus WAL supports full-cluster recovery and PITR.

## 110. WAL Archiving

Archive completed WAL segments to durable independent storage.

## 111. Point-in-Time Recovery

Restore:

```text
base backup
+ archived WAL
+ target timestamp / LSN / restore point
```

## 112. RPO and RTO

RPO: acceptable data loss.

RTO: acceptable recovery duration.

Include failure detection, backup transfer, WAL replay and client cutover.

## 113. Replication Is Not Backup

Bad deletes and updates replicate.

Backups retain historical recovery points.

## 114. Restore Testing

Test full restore, PITR, selected object restore and recovery duration.


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL PITR
What to use: Base backup plus archived WAL replay stopping at a target timestamp.
Preferred source: PostgreSQL continuous-archiving and PITR documentation.
Search terms: site:postgresql.org/docs PostgreSQL PITR diagram
Purpose: Explain historical recovery.
Alt text: PostgreSQL restores a base backup and replays archived WAL to a chosen recovery point.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Replication is not backup
What to use: Bad DELETE copied to replicas while an independent backup preserves older data.
Preferred source: Create an original diagram from PostgreSQL backup and replication docs.
Search terms: PostgreSQL replication not backup
Purpose: Prevent a reliability misconception.
Alt text: PostgreSQL replication copies logical mistakes, while backups allow historical recovery.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Connection Management

## 115. Why Pool

Each direct connection creates a backend process and consumes memory and scheduling resources.

Use a bounded global connection budget.

## 116. PgBouncer Modes

- **Session pooling:** Preserves session state.
- **Transaction pooling:** Reuses backend after each transaction.
- **Statement pooling:** Most restrictive.

Transaction pooling can conflict with:

- Session advisory locks.
- Session temp tables.
- LISTEN/NOTIFY assumptions.
- Session state.
- Some prepared-statement usage depending on configuration/version.

## 117. Too Many Connections

Effects:

- Context switching.
- Memory pressure.
- Lock contention.
- Higher tail latency.

More connections do not guarantee more throughput.

## 118. Primary/Replica Routing

Route writes and fresh reads to primary.

Route only staleness-tolerant reads to replicas.

## 119. Idle Transactions

Set timeout and fix application transaction boundaries.


<!-- IMAGE PLACEHOLDER
Title: PgBouncer transaction pooling
What to use: Many client connections multiplexed to a small PostgreSQL backend set.
Preferred source: PgBouncer official docs and PostgreSQL connection model.
Search terms: PgBouncer PostgreSQL transaction pooling diagram
Purpose: Show connection multiplexing.
Alt text: PgBouncer maps many application clients onto a bounded set of PostgreSQL backends.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Primary and replica read routing
What to use: Writes and read-after-write go to primary; reporting queries go to replicas.
Preferred source: PostgreSQL hot-standby documentation.
Search terms: PostgreSQL primary replica routing consistency
Purpose: Explain consistency-aware routing.
Alt text: PostgreSQL applications send freshness-sensitive traffic to the primary and selected reads to replicas.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Caching and Derived Data

## 120. Database Cache vs Redis

PostgreSQL shared/OS caches store pages.

Redis stores decoded objects, responses and specialized hot state.

Add Redis only when the workload benefits from:

- Lower latency.
- Lower database QPS.
- Precomputed values.
- TTL and eviction.

## 121. Cache-Aside

Redis miss falls back to PostgreSQL, then cache is populated.

Invalidation is not atomic with database commit unless a coordinated pattern is used.

## 122. Materialized Views

PostgreSQL materialized views store a query result and require explicit refresh in core PostgreSQL.

## 123. Summary Tables

Use durable aggregate tables for frequently requested totals.

Maintain through:

- Application transaction.
- Background job.
- CDC/stream processing.
- Triggers carefully.


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL cache-aside
What to use: Application checks Redis, falls back to PostgreSQL and invalidates after a committed write.
Preferred source: Create an original diagram based on PostgreSQL and Redis behavior.
Search terms: PostgreSQL Redis cache aside
Purpose: Show source-of-truth and cache responsibilities.
Alt text: PostgreSQL stores durable state while Redis caches frequently read results.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Sharding and Multi-Region

## 124. When to Shard

Only after verifying:

- Query/index quality.
- Vertical scaling.
- Pooling.
- Caching.
- Read replicas.
- Archival.
- Partitioning.
- Workload separation.

## 125. Shard Key

A good shard key is:

- High cardinality.
- Stable.
- Even in data and traffic.
- Present in common queries.
- Able to co-locate transactions.

Common choice:

```text
tenant_id
```

## 126. Directory-Based Routing

Map:

```text
tenant_id -> shard_id
```

Allows moving large tenants but makes routing metadata critical.

## 127. Cross-Shard Transactions

Require:

- Avoidance by ownership.
- Saga.
- Distributed transaction.
- Distributed SQL.

## 128. Global Uniqueness

Use UUID, shard-prefixed IDs or central ID allocation.

## 129. Multi-Region

Common PostgreSQL design:

```text
one writable region
+ asynchronous remote standbys
```

Remote writes have WAN latency. Failover needs fencing and can lose recent asynchronous writes.

## 130. Multi-Primary

Ordinary physical streaming replication is not active-active multi-primary.

Use ownership partitioning, specialized extensions/products or distributed SQL when truly required.


<!-- IMAGE PLACEHOLDER
Title: Tenant sharding
What to use: Router sends each tenant to a PostgreSQL primary/replica shard group.
Preferred source: Create an original sharding diagram.
Search terms: PostgreSQL tenant sharding architecture
Purpose: Show application-level scale-out.
Alt text: A routing layer maps each tenant to one PostgreSQL shard for local transactions.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Single-writer multi-region PostgreSQL
What to use: Primary region streams WAL to a remote DR region with local stale reads.
Preferred source: PostgreSQL warm-standby documentation.
Search terms: PostgreSQL multi region asynchronous standby
Purpose: Explain the common regional topology.
Alt text: PostgreSQL commonly uses one writable region and asynchronous remote disaster-recovery replicas.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Online tenant shard migration
What to use: Snapshot copy, CDC catch-up, validation, router cutover and cleanup.
Preferred source: Create an original diagram based on PostgreSQL logical replication.
Search terms: PostgreSQL tenant shard migration CDC
Purpose: Show the operational migration workflow.
Alt text: A PostgreSQL tenant moves shards through copy, change capture and routing cutover.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Security and Operations

## 131. Authentication

Use supported secure methods such as SCRAM, certificates, Kerberos or provider-integrated authentication as appropriate.

## 132. TLS

Encrypt client and replication connections when required.

## 133. Roles and Least Privilege

Separate:

- Object owner.
- Migration role.
- Runtime writer.
- Runtime reader.
- Reporting.
- Administrator.

## 134. Row-Level Security

RLS can enforce tenant row policies.

Test carefully with:

- Pooling.
- Session context.
- Owner/superuser behavior.
- Performance.

## 135. `search_path`

Use trusted schemas and explicit configuration to avoid object-resolution attacks.

## 136. Monitoring

Track:

- Query latency and QPS.
- Connections and pool queues.
- Lock waits and deadlocks.
- Cache/I/O.
- WAL and checkpoints.
- Vacuum and transaction age.
- Replica lag.
- Slot retention.
- Disk.
- Backup health.

## 137. Important Views/Extensions

- `pg_stat_activity`.
- `pg_locks`.
- `pg_stat_database`.
- `pg_stat_all_tables`.
- `pg_stat_all_indexes`.
- `pg_stat_replication`.
- `pg_replication_slots`.
- `pg_stat_wal`.
- `pg_stat_io` in supported modern versions.
- `pg_stat_statements`.


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL role hierarchy
What to use: Owner, migration, app-read, app-write and login roles with grants.
Preferred source: PostgreSQL roles and privileges documentation.
Search terms: site:postgresql.org/docs PostgreSQL role hierarchy
Purpose: Show least-privilege design.
Alt text: PostgreSQL runtime users inherit limited privileges while a separate role owns schema objects.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL operations dashboard
What to use: Panels for queries, connections, locks, vacuum, WAL, replicas, slots, disk and backups.
Preferred source: PostgreSQL monitoring-statistics documentation.
Search terms: site:postgresql.org/docs PostgreSQL monitoring pg_stat dashboard
Purpose: Define production observability.
Alt text: A PostgreSQL dashboard monitors query, connection, maintenance, replication and storage health.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Lock blocking tree
What to use: One blocker at the root with several waiting sessions beneath it.
Preferred source: PostgreSQL lock monitoring documentation.
Search terms: PostgreSQL blocking sessions tree
Purpose: Show lock amplification.
Alt text: One PostgreSQL transaction can block a tree of waiting requests.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Capacity Planning

## 138. Inputs

Estimate:

```text
rows created/day
updates/day
deletes/day
average measured row bytes
index bytes/row
retention
read QPS
write TPS
active concurrency
WAL bytes/s
replicas
backup retention
growth
```

## 139. Storage

Approximate:

```text
primary data
= heap
+ indexes
+ TOAST
+ bloat/headroom
```

Total replicated storage:

```text
primary data × number of copies
```

Backups and WAL archive are separate.

## 140. Example

Assume:

```text
10 million rows/day
3-year retention
10.95 billion rows
heap = 220 bytes/row
indexes = 180 bytes/row
```

```text
10.95B × 400 bytes
≈ 4.38 TB
```

Add 30% operational/bloat margin:

```text
≈ 5.7 TB per copy
```

With primary and two replicas:

```text
≈ 17.1 TB
```

before backups and archived WAL.

## 141. WAL

Example assumption:

```text
20,000 write transactions/s
2 KB WAL/transaction
= 40 MB/s
≈ 3.46 TB/day
```

WAL affects network, archive, slots and recovery time.

## 142. Memory

Budget:

```text
shared buffers
+ OS page cache
+ backend/process memory
+ sort/hash memory
+ vacuum/maintenance
+ WAL
+ safety
```

## 143. Connections and Little's Law

Example:

```text
50,000 DB operations/s
average active DB time = 5 ms
```

Approximate active concurrency:

```text
50,000 × 0.005 = 250
```

This does not require 50,000 database connections.

## 144. Required Shards

If sharding becomes necessary:

```text
required shards
= max(
  storage constraint,
  write throughput,
  CPU,
  I/O,
  maintenance,
  regional ownership
)
```

No universal PostgreSQL TPS number exists. Benchmark the real schema and transaction mix.


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL capacity waterfall
What to use: Rows and row bytes flowing to heap, indexes, bloat margin, replicas, WAL and backups.
Preferred source: Create an original diagram from PostgreSQL storage concepts.
Search terms: PostgreSQL capacity planning heap indexes WAL replicas
Purpose: Provide a reusable sizing model.
Alt text: PostgreSQL capacity includes heap, indexes, operational margin, replicas, WAL and backups.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL I/O workload
What to use: WAL writes, heap/index reads, checkpoints, vacuum, replica streaming and backups sharing storage/network.
Preferred source: PostgreSQL WAL, vacuum and buffer docs.
Search terms: PostgreSQL IO workload WAL vacuum checkpoint
Purpose: Show simultaneous resource demands.
Alt text: PostgreSQL handles query I/O, WAL, dirty-page writes, vacuum and replication concurrently.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Failure Scenarios

## 145. Process Crash

Connections break. In-flight transactions abort. PostgreSQL replays WAL and recovers durable commits.

## 146. Async Primary Loss

Recent acknowledged writes can be missing on the promoted standby.

## 147. Synchronous Standby Loss

Writes may wait or fail unless another synchronous standby is eligible.

## 148. Replica Lag

Remove lagging replicas from freshness-sensitive read traffic.

## 149. Disk Full

Common causes:

- Data growth.
- WAL archive failure.
- Replication slot.
- Temp files.
- Bloat.
- Backup leftovers.

Alert well before capacity.

## 150. Connection Exhaustion

Pool and reserve administrative connections.

## 151. Lock Storm

Find the root blocker, use timeouts and fix transaction boundaries/order.

## 152. Vacuum Lag

Can cause bloat and wraparound risk.

## 153. Schema Migration Lock

Use expand/contract migrations, concurrent index creation and bounded lock timeouts.

## 154. Application Corruption

Replicas copy it. Use PITR, audit and compensating transactions.


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL failure matrix
What to use: Process crash, host loss, replica loss, disk full, slot growth, lock storm and application corruption mapped to recovery.
Preferred source: Create an original diagram from PostgreSQL reliability docs.
Search terms: PostgreSQL failure recovery matrix
Purpose: Summarize reliability mechanisms.
Alt text: PostgreSQL failures require WAL recovery, failover, cleanup, PITR or application compensation.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Expand-contract migration
What to use: Add compatible schema, deploy compatible app, backfill, switch reads, validate and remove old schema.
Preferred source: PostgreSQL ALTER TABLE and concurrent-index documentation.
Search terms: PostgreSQL expand contract migration
Purpose: Show safe production DDL.
Alt text: A PostgreSQL schema change is rolled out through backward-compatible expansion, backfill and later contraction.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Example HLD Designs

## 155. URL Shortener

```sql
CREATE TABLE urls
(
    short_code TEXT PRIMARY KEY,
    long_url   TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ
);
```

PostgreSQL is the durable source; Redis can cache hot mappings.

## 156. Idempotent Payment API

```sql
CREATE TABLE payment_requests
(
    merchant_id     BIGINT NOT NULL,
    idempotency_key TEXT NOT NULL,
    request_hash    BYTEA NOT NULL,
    status          TEXT NOT NULL,
    response_body   JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (merchant_id, idempotency_key)
);
```

## 157. Inventory

```sql
UPDATE inventory
SET available = available - ?,
    reserved = reserved + ?
WHERE product_id = ?
  AND available >= ?;
```

Affected row count determines success.

## 158. Job Scheduler

```sql
CREATE INDEX jobs_ready_idx
ON jobs (priority DESC, scheduled_at, job_id)
WHERE status = 'READY';
```

Claim with `FOR UPDATE SKIP LOCKED`.

## 159. Seat Booking

Use a primary key `(show_id, seat_id)` and one transaction with row locking or a conditional state update.

## 160. Ledger

Use immutable transactions and entries, exact `NUMERIC`, uniqueness on external reference and transactional balance checks.

## 161. Multi-Tenant SaaS

Include `tenant_id` in keys and indexes for tenant-scoped access.

Use RLS as defense in depth where appropriate.

## 162. Ad Platform

- PostgreSQL: campaign and budget configuration.
- Redis: hot serving state and caps.
- Kafka: events.
- ClickHouse: impressions/click analytics.
- Elasticsearch: creative or campaign search if needed.

## 163. Audit Events

Partition by time for moderate scale; stream to object storage/search/analytics when volume grows.


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL with specialized systems
What to use: PostgreSQL transactional core connected to Redis, Kafka, Elasticsearch and ClickHouse.
Preferred source: Create an original system-design diagram.
Search terms: PostgreSQL Redis Kafka Elasticsearch ClickHouse architecture
Purpose: Show workload separation.
Alt text: PostgreSQL holds transactional truth while specialized systems serve cache, streaming, search and analytics.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


<!-- IMAGE PLACEHOLDER
Title: Seat booking race
What to use: Two users attempt the same seat; one row lock/update succeeds and the other waits or fails.
Preferred source: Create an original diagram from PostgreSQL locking semantics.
Search terms: PostgreSQL seat booking concurrency
Purpose: Demonstrate transactional correctness.
Alt text: PostgreSQL serializes concurrent reservation attempts for the same seat.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# PostgreSQL vs Other Databases

| System | Best at | Main limitation compared with PostgreSQL |
|---|---|---|
| PostgreSQL | Transactions, constraints, joins and evolving SQL | Single-primary write scale |
| Redis | Hot cache and atomic in-memory structures | Not a relational source of truth |
| Cassandra | Distributed writes and partition reads | Limited joins and cross-row transactions |
| ClickHouse | Large analytical scans | Poor fit for OLTP updates |
| Elasticsearch | Search relevance | Weaker canonical transactional semantics |
| DynamoDB | Managed key-partition scale | Limited relational flexibility |
| MongoDB | Flexible documents | Different constraints and relational modelling |
| Kafka | Durable event log | Not a relational query database |
| Distributed SQL | Horizontal transactional SQL | Higher network/operational complexity |

## 164. PostgreSQL vs Redis

Use PostgreSQL for durable truth and transactions.

Use Redis for cache, sessions, rate limits, leaderboards and hot counters.

## 165. PostgreSQL vs Cassandra

Use PostgreSQL for relationships, transactions and flexible queries.

Use Cassandra for massive partitioned writes and known key/range reads.

## 166. PostgreSQL vs ClickHouse

Use PostgreSQL to create/update an order transactionally.

Use ClickHouse to aggregate billions of orders by time and dimension.

## 167. PostgreSQL vs Elasticsearch

PostgreSQL can provide exact filters and moderate full-text search.

Elasticsearch is better for advanced relevance, fuzzy search and distributed search scale.

## 168. PostgreSQL vs DynamoDB

PostgreSQL offers relational flexibility and constraints.

DynamoDB offers managed partition-key scaling and a more constrained access model.

## 169. PostgreSQL vs Distributed SQL

Use distributed SQL only when multi-node transaction scale or multi-region consistency is truly required and the added latency/complexity is acceptable.


<!-- IMAGE PLACEHOLDER
Title: Database selection matrix
What to use: PostgreSQL, Redis, Cassandra, ClickHouse, Elasticsearch, DynamoDB and distributed SQL positioned by transaction strength and query shape.
Preferred source: Create an original comparison from official docs.
Search terms: PostgreSQL database comparison matrix
Purpose: Provide an interview selection visual.
Alt text: PostgreSQL covers transactional relational workloads while other systems specialize in cache, scale, analytics and search.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Common Mistakes

- Missing constraints and relying only on application validation.
- Check-then-insert instead of a unique constraint.
- Too many direct connections.
- Long or idle transactions.
- External calls inside transactions.
- Indexing every column.
- Wrong multicolumn index order.
- Increasing `work_mem` globally without concurrency math.
- Disabling autovacuum.
- Large row-by-row retention deletes.
- Abandoned replication slots.
- Treating replicas as strongly current.
- Treating replication as backup.
- Assuming failover is transparent.
- Storing large blobs in the database.
- One giant JSONB document.
- Over-partitioning.
- Premature sharding.
- Running broad analytics on the OLTP primary.


<!-- IMAGE PLACEHOLDER
Title: PostgreSQL anti-patterns
What to use: Poster showing check-then-insert, too many connections, long transactions, disabled vacuum, stale replicas and premature sharding.
Preferred source: Create an original diagram from PostgreSQL official best practices.
Search terms: PostgreSQL common mistakes interview
Purpose: Provide a final visual review.
Alt text: Common PostgreSQL mistakes damage correctness, query latency, vacuum health and reliability.
Editorial note: Verify the image licence before publishing. Prefer official PostgreSQL documentation. If no clear reusable official image exists, create an original Excalidraw diagram from the official behavior.
-->


# Interview Decision Checklist

## 170. Choose PostgreSQL When

```text
[ ] ACID transactions are required.
[ ] Constraints protect business invariants.
[ ] Data has relationships.
[ ] Queries evolve.
[ ] Updates and deletes are common.
[ ] Strong read-after-write is expected.
[ ] One primary can meet write scale.
[ ] JSON flexibility is useful alongside relational columns.
```

## 171. Avoid PostgreSQL Alone When

```text
[ ] Broad petabyte-scale analytics dominate.
[ ] Sub-millisecond cache access dominates.
[ ] Distributed search relevance is central.
[ ] Durable stream replay is central.
[ ] Low-latency multi-region active-active writes are mandatory.
[ ] One primary cannot satisfy demonstrated write/storage limits.
```

## 172. Schema Checklist

```text
[ ] Primary key.
[ ] Unique business keys.
[ ] Foreign keys.
[ ] Check and not-null constraints.
[ ] Transaction boundaries.
[ ] Concurrency strategy.
[ ] Query patterns.
[ ] Required indexes only.
[ ] Retention and cleanup.
[ ] JSONB vs typed columns.
[ ] Partitioning justification.
```

## 173. Production Checklist

```text
[ ] Connection pool.
[ ] Statement/lock/idle-transaction timeouts.
[ ] Autovacuum monitoring.
[ ] WAL and checkpoint monitoring.
[ ] Backup and PITR tests.
[ ] Replica and slot monitoring.
[ ] Safe failover and fencing.
[ ] Slow-query and lock analysis.
[ ] Security roles and TLS.
[ ] Capacity/failure headroom.
```

# Interview Questions and Answers

## 174. Why is PostgreSQL a good default?

It provides strong correctness, flexible SQL, mature indexes, MVCC, replication and backups without forcing distributed complexity.

## 175. What is MVCC?

MVCC stores row versions and uses snapshots to decide visibility, allowing readers and writers to proceed concurrently.

## 176. Does an UPDATE modify a row in place?

Conceptually it creates a new tuple version and makes the old version obsolete.

## 177. Why is vacuum needed?

To reclaim dead version space, clean indexes, maintain visibility metadata and freeze transaction IDs.

## 178. What is HOT?

A same-page update that avoids new index entries when indexed columns are unchanged.

## 179. Read Committed vs Repeatable Read?

Read Committed takes a new snapshot per statement. Repeatable Read holds a stable snapshot.

## 180. Why can Serializable abort?

It detects dependency structures that could violate serial execution and requires retry.

## 181. What is a lost update?

Two transactions overwrite changes derived from the same old value. Use atomic update, row lock or optimistic version.

## 182. MVCC vs locks?

MVCC controls visibility. Locks serialize conflicting operations and protect resources/invariants.

## 183. Why is WAL required?

It allows durable commit before data pages are flushed and powers recovery, replication and PITR.

## 184. What is a checkpoint?

A recovery boundary that flushes required dirty pages and records a checkpoint in WAL.

## 185. Why can too many checkpoints hurt?

They increase page-write pressure and full-page WAL images.

## 186. What is table bloat?

Allocated heap space with many obsolete versions or unused pages.

## 187. Does normal vacuum shrink files?

Usually no; it makes space reusable internally.

## 188. Why might PostgreSQL use a sequential scan?

Reading most of a table sequentially can be cheaper than many index and heap lookups.

## 189. B-tree vs GIN vs GiST vs BRIN?

B-tree for equality/range/order, GIN for inverted multi-valued search, GiST for extensible ranges/geometry, BRIN for page-range summaries on correlated data.

## 190. Why does index order matter?

B-tree ordering is lexicographic, so leading predicates determine the narrowest scan range.

## 191. What is a partial index?

An index over only rows satisfying a predicate.

## 192. What is an index-only scan?

A query answered from index data when visibility metadata removes the need for heap checks.

## 193. What does EXPLAIN ANALYZE show?

Actual execution, row counts, loops and timings; BUFFERS adds page activity.

## 194. Why are statistics important?

The planner needs accurate cardinality and distribution estimates to choose scans, joins and memory strategies.

## 195. What is `work_mem`?

A limit for individual sort/hash operations, potentially multiplied across operations, workers and sessions.

## 196. When should you partition?

When lifecycle, pruning or maintenance benefits justify the added complexity.

## 197. Partitioning vs sharding?

Partitioning is inside one cluster; sharding is across independent servers.

## 198. How does streaming replication work?

The primary streams WAL to standbys, which receive, flush and replay it.

## 199. Async vs sync replication?

Async has lower latency but a failover loss window. Sync waits for replica acknowledgement but can reduce availability.

## 200. Can replicas be stale?

Yes, because WAL receive, flush and replay can lag.

## 201. What is a replication slot?

A retention point that prevents required WAL from being removed before a consumer receives it.

## 202. Why can a slot fill disk?

A stopped consumer prevents WAL recycling/removal.

## 203. What is logical replication?

Selected table changes decoded from WAL and applied to subscriber tables.

## 204. What is replica identity?

The key used to identify updated/deleted rows for logical replication.

## 205. What is PITR?

Restoring a base backup and replaying archived WAL to a selected recovery point.

## 206. Why is replication not backup?

Application mistakes replicate; backups preserve older states.

## 207. Why use PgBouncer?

To multiplex many clients onto a bounded number of PostgreSQL backend processes.

## 208. How do you prevent duplicate inserts?

A unique constraint plus `ON CONFLICT`.

## 209. How do you implement optimistic locking?

Update using an expected version in the predicate and verify affected rows.

## 210. How do workers claim jobs?

`FOR UPDATE SKIP LOCKED` over an index supporting ready-job order.

## 211. How do you prevent double booking?

Use one transaction with row locks or a conditional state update and constraints.

## 212. Why avoid remote calls inside a transaction?

They extend lock and snapshot lifetime and fail independently.

## 213. What is the outbox pattern?

Business data and an outbox event commit together; a separate publisher delivers it idempotently.

## 214. How do you scale reads?

Optimize, pool, cache, add replicas and move analytics/search to specialized stores.

## 215. How do you scale writes?

Optimize transactions, batch, use stronger hardware, partition for maintenance and shard only after measuring one-primary limits.

## 216. PostgreSQL or Redis?

PostgreSQL for durable relational truth; Redis for hot ephemeral or derived state.

## 217. PostgreSQL or Cassandra?

PostgreSQL for transactions and flexible queries; Cassandra for massive partitioned writes.

## 218. PostgreSQL or ClickHouse?

PostgreSQL for OLTP; ClickHouse for large analytical scans.

## 219. PostgreSQL or Elasticsearch?

PostgreSQL for canonical records; Elasticsearch for advanced search.

## 220. Biggest PostgreSQL design mistake?

Ignoring database-level correctness and operations: missing constraints, long transactions, excessive connections, poor indexes and unhealthy vacuum eventually fail.

# Thirty-Second Summary

```text
PostgreSQL is a transactional relational database.

It is best for:
- Systems of record.
- ACID transactions.
- Constraints and relationships.
- Point reads and bounded ranges.
- Frequent updates and deletes.
- Flexible SQL and evolving query patterns.

Core rules:
- Put durable invariants in constraints and transactions.
- Keep transactions short.
- Understand MVCC and vacuum.
- Index actual query patterns.
- Use EXPLAIN ANALYZE instead of guessing.
- Pool connections.
- Treat replicas as potentially stale.
- Monitor replication slots and WAL.
- Test backups and PITR.
- Partition for lifecycle, not as automatic horizontal scale.
- Shard only after proving one-primary limits.
```

<!--
EDITORIAL SOURCES TO VERIFY BEFORE PUBLISHING

Use current official PostgreSQL documentation as the primary source:

- Server architecture and background processes
- Physical storage, page layout and TOAST
- MVCC and transaction isolation
- Explicit and advisory locking
- WAL, checkpoints and crash recovery
- Continuous archiving and PITR
- Routine vacuuming and autovacuum
- Index types, multicolumn, partial, expression and index-only scans
- EXPLAIN, planner statistics and extended statistics
- Declarative partitioning
- COPY, INSERT ON CONFLICT and MERGE
- Streaming and synchronous replication
- Hot standby and replication slots
- Logical replication and logical decoding
- Backup/restore tools
- Roles, privileges, RLS and pg_hba.conf
- Monitoring statistics and pg_stat_statements

VERSION-SENSITIVE NOTES

- This guide targets PostgreSQL 18, the current stable documentation line in July 2026. PostgreSQL 19 is a beta/development line and should not be the production baseline.
- Verify the latest PostgreSQL 18 minor release before publishing.
- UUID, logical replication, planner and monitoring capabilities evolve between major releases.
- Managed PostgreSQL failover, synchronous replication and storage behavior depend on the provider and service tier.
- Performance and capacity values in this guide are interview examples, not PostgreSQL guarantees.
-->
