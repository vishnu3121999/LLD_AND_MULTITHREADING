
---
title: PostgreSQL
slug: postgres
summary: Relational OLTP database used when the system needs transactions, strong consistency, SQL queries, and reliable structured data storage.
tags:
  - Database
  - SQL
  - OLTP
  - Transactions
  - HLD
difficulty: Medium
---

# PostgreSQL

## 1. What is PostgreSQL?

- PostgreSQL is a relational database.
- It stores data in tables, rows, and columns.
- It supports SQL queries.
- It supports ACID transactions.
- It is mainly used for OLTP workloads.
- OLTP means online transaction processing.
- OLTP systems handle user-facing application operations like:
  - creating users
  - placing orders
  - booking tickets
  - making payments
  - storing metadata
  - updating account balances

## 2. Main Interview Angle

- PostgreSQL should be used when the system needs:
  - strong consistency
  - transactions
  - relational data
  - joins
  - constraints
  - secondary indexes
  - flexible SQL queries
  - reliable source-of-truth storage

- PostgreSQL is usually the default database choice in HLD interviews unless there is a clear reason to use NoSQL.

## 3. When to Use PostgreSQL?

- Use PostgreSQL when:
  - data is structured
  - relationships between entities are important
  - transactions are required
  - consistency is important
  - queries need joins
  - queries need filtering, sorting, and pagination
  - data volume is moderate to large but not internet-scale event ingestion
  - correctness is more important than extreme write throughput

## 4. When Not to Use PostgreSQL?

- Avoid PostgreSQL when:
  - write throughput is extremely high
  - data is mostly append-only event data
  - queries are mostly large analytical scans
  - workload needs massive horizontal writes
  - schema changes frequently and unpredictably
  - data access pattern is simple key-value lookup at very high QPS
  - full-text search is the main requirement
  - time-series aggregation at massive scale is the main requirement

## 5. Common HLD Use Cases

- User service
- Auth service
- Orders service
- Payments metadata
- Booking system
- Inventory system
- URL shortener metadata
- Ride booking metadata
- Wallet ledger
- Admin dashboard
- Subscription management
- Product catalog for small or medium scale
- Job metadata
- Configuration storage

## 6. Example Systems Where PostgreSQL Fits

- URL Shortener:
  - store short URL to long URL mapping
  - store owner, creation time, expiry time
  - store custom aliases

- BookMyShow:
  - store movies, theatres, shows, seats, bookings
  - use transactions for seat booking

- Payment System:
  - store payment intent
  - store transaction status
  - store idempotency key
  - store ledger entries

- Uber:
  - store users, drivers, rides, payments
  - not ideal for real-time location updates at massive scale

- Google Drive:
  - store file metadata
  - store folder hierarchy
  - store permissions
  - actual file blobs should go to object storage

## 7. Data Model

- PostgreSQL stores data in:
  - databases
  - schemas
  - tables
  - rows
  - columns

- Common table design:
  - primary key
  - foreign keys
  - indexes
  - constraints
  - timestamps
  - status fields

## 8. Example Schema

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    status TEXT NOT NULL,
    amount_cents BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id_created_at
ON orders(user_id, created_at DESC);
````

## 9. Query Patterns

* PostgreSQL is good for:

    * lookup by primary key
    * lookup by unique key
    * filtering by indexed columns
    * joins
    * sorting
    * pagination
    * range queries
    * aggregations on moderate data
    * transactional updates
    * relational queries

* PostgreSQL is not ideal for:

    * very large analytical scans
    * high-volume event aggregation
    * unbounded log search
    * full-text ranking at search-engine scale
    * extremely high-cardinality time-series ingestion

## 10. Common Query Examples

### Get user by id

```sql
SELECT *
FROM users
WHERE id = 123;
```

### Get recent orders of a user

```sql
SELECT *
FROM orders
WHERE user_id = 123
ORDER BY created_at DESC
LIMIT 20;
```

### Get order with user details

```sql
SELECT 
    o.id,
    o.status,
    o.amount_cents,
    u.name,
    u.email
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.id = 1001;
```

### Count orders by status

```sql
SELECT status, COUNT(*)
FROM orders
GROUP BY status;
```

## 11. Transactions

* PostgreSQL supports ACID transactions.

* ACID means:

    * Atomicity:

        * all operations in a transaction succeed or all fail
    * Consistency:

        * database constraints remain valid
    * Isolation:

        * concurrent transactions should not corrupt each other
    * Durability:

        * committed data survives crashes

## 12. Transaction Example

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 100
WHERE id = 1;

UPDATE accounts
SET balance = balance + 100
WHERE id = 2;

INSERT INTO ledger_entries(from_account_id, to_account_id, amount)
VALUES (1, 2, 100);

COMMIT;
```

* This is useful for:

    * payments
    * wallet transfers
    * seat booking
    * inventory updates
    * order creation

## 13. Isolation Levels

* PostgreSQL supports multiple isolation levels:

    * Read Committed
    * Repeatable Read
    * Serializable

### Read Committed

* Default isolation level.
* Each query sees only committed data.
* Good for most application workloads.
* May allow non-repeatable reads.

### Repeatable Read

* Transaction sees a stable snapshot.
* Useful when multiple reads in a transaction must see the same data.

### Serializable

* Strongest isolation level.
* Makes concurrent transactions behave as if they ran one after another.
* More expensive.
* Can cause transaction retries.

## 14. MVCC

* PostgreSQL uses MVCC.
* MVCC means Multi-Version Concurrency Control.
* Readers do not block writers.
* Writers do not block readers in most cases.
* PostgreSQL keeps multiple versions of rows internally.
* A transaction sees the row version valid for its snapshot.

## 15. Why MVCC Matters in HLD?

* It improves concurrency.
* Read-heavy workloads can continue while writes are happening.
* Long-running transactions can create cleanup problems.
* Old row versions need to be cleaned by vacuum.

## 16. Write Path

* Simplified PostgreSQL write path:

```md
Client
  -> PostgreSQL Server
  -> Parse SQL
  -> Plan query
  -> Execute query
  -> Modify data pages in memory
  -> Write WAL
  -> Commit transaction
  -> Later flush dirty pages to disk
```

* WAL means Write-Ahead Log.
* PostgreSQL writes changes to WAL before data pages are flushed.
* WAL helps recover committed data after crashes.

## 17. Read Path

* Simplified PostgreSQL read path:

```md
Client
  -> PostgreSQL Server
  -> Parse SQL
  -> Plan query
  -> Check indexes
  -> Read data from shared buffers
  -> If not in memory, read from disk
  -> Return rows
```

* Reads are faster when:

    * needed data is indexed
    * data is already in memory
    * query returns fewer rows
    * query avoids large scans

## 18. Indexing

* Indexes improve read performance.
* Indexes increase write cost.
* Every insert/update/delete may need to update indexes.

## 19. Common Index Types

### B-Tree Index

* Default index type.
* Used for:

    * equality lookup
    * range query
    * sorting
    * prefix matching in some cases

```sql
CREATE INDEX idx_users_email
ON users(email);
```

### Composite Index

* Index on multiple columns.
* Column order matters.

```sql
CREATE INDEX idx_orders_user_status_created_at
ON orders(user_id, status, created_at DESC);
```

* Good for queries like:

```sql
SELECT *
FROM orders
WHERE user_id = 123
AND status = 'COMPLETED'
ORDER BY created_at DESC;
```

### Unique Index

* Ensures uniqueness.

```sql
CREATE UNIQUE INDEX idx_users_email_unique
ON users(email);
```

### Partial Index

* Indexes only subset of rows.

```sql
CREATE INDEX idx_active_orders
ON orders(user_id, created_at DESC)
WHERE status = 'ACTIVE';
```

* Useful when queries repeatedly filter on a specific condition.

### GIN Index

* Useful for:

    * JSONB queries
    * array columns
    * full-text search

```sql
CREATE INDEX idx_documents_metadata
ON documents USING GIN(metadata);
```

### BRIN Index

* Useful for very large tables where data is naturally ordered.
* Common for timestamp-based tables.
* Smaller than B-Tree.
* Less precise than B-Tree.

```sql
CREATE INDEX idx_events_created_at_brin
ON events USING BRIN(created_at);
```

## 20. Indexing Rules for Interviews

* Add indexes on columns used in:

    * WHERE
    * JOIN
    * ORDER BY
    * GROUP BY

* Do not add too many indexes.

* Composite index order matters.

* Indexes speed up reads but slow down writes.

* Indexes consume extra storage.

* For high-write tables, keep indexes minimal.

## 21. Pagination

### Offset Pagination

```sql
SELECT *
FROM orders
WHERE user_id = 123
ORDER BY created_at DESC
LIMIT 20 OFFSET 1000;
```

* Simple to implement.
* Slow for deep pages.
* Database still scans skipped rows.

### Cursor Pagination

```sql
SELECT *
FROM orders
WHERE user_id = 123
AND created_at < '2026-01-01 10:00:00'
ORDER BY created_at DESC
LIMIT 20;
```

* Better for large datasets.
* Common in feeds, order history, notifications, and messages.

## 22. Replication

* PostgreSQL supports primary-replica replication.

```md
Primary DB
  -> handles writes
  -> replicates changes to replicas

Replica DB
  -> handles reads
  -> can be promoted during failover
```

## 23. Read Replicas

* Read replicas are used to scale read traffic.
* Writes still go to primary.
* Read replicas may have replication lag.
* Recently written data may not immediately appear on replicas.

## 24. Replication Lag

* Replication lag means replica is behind primary.
* This can cause stale reads.

### Example

* User updates profile.
* Write goes to primary.
* Next read goes to replica.
* Replica has not received update yet.
* User sees old profile data.

### Solutions

* Read-after-write from primary.
* Route critical reads to primary.
* Use sticky sessions for short duration.
* Monitor replica lag.
* Use synchronous replication if stronger durability is needed.

## 25. Synchronous vs Asynchronous Replication

### Asynchronous Replication

* Primary commits without waiting for replica.
* Better write latency.
* Risk of data loss if primary crashes before replica receives WAL.

### Synchronous Replication

* Primary waits for replica acknowledgment.
* Better durability.
* Higher write latency.
* Lower availability if replica is slow or unavailable.

## 26. Fault Tolerance

* PostgreSQL fault tolerance usually needs:

    * primary database
    * one or more replicas
    * automated failover
    * backups
    * WAL archiving
    * monitoring
    * connection routing

## 27. Failover

* If primary fails:

    * one replica is promoted to primary
    * application should reconnect to new primary
    * old primary must not accept writes after recovery

* Important issue:

    * split brain must be avoided
    * only one primary should accept writes

## 28. Backups

* Backups are required even if replication exists.

* Replication is not a replacement for backups.

* Why?

    * accidental delete gets replicated
    * bad migration gets replicated
    * corrupted data can get replicated

* Common backup strategy:

    * periodic full backups
    * WAL archiving
    * point-in-time recovery

## 29. Partitioning

* Partitioning splits one logical table into smaller physical partitions.

* Common partitioning strategies:

    * range partitioning
    * list partitioning
    * hash partitioning

## 30. Range Partitioning Example

* Useful for time-based data.

```sql
CREATE TABLE events (
    id BIGSERIAL,
    user_id BIGINT NOT NULL,
    event_type TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
) PARTITION BY RANGE (created_at);
```

* Example partitions:

    * events_2026_01
    * events_2026_02
    * events_2026_03

## 31. Why Partitioning Helps

* Smaller indexes per partition.
* Faster deletes by dropping old partitions.
* Better maintenance.
* Better query performance if partition pruning works.

## 32. When Partitioning Helps

* Use partitioning when:

    * table is very large
    * queries commonly filter by partition key
    * old data needs to be deleted frequently
    * data is naturally grouped by time, tenant, region, or hash

## 33. When Partitioning Does Not Help

* Partitioning does not automatically make every query faster.
* If queries do not filter by partition key, many partitions may still be scanned.
* Bad partition key can make performance worse.
* Too many partitions can increase overhead.

## 34. Sharding

* PostgreSQL does not automatically shard like Cassandra.
* Sharding means splitting data across multiple database nodes.

## 35. Common Sharding Strategies

### User-Based Sharding

```md
shard_id = hash(user_id) % number_of_shards
```

* Good when most queries are scoped to a user.
* Hard for cross-user queries.

### Tenant-Based Sharding

* Each tenant or group of tenants is assigned to a shard.
* Common in B2B SaaS systems.

### Region-Based Sharding

* Data is split by geography.
* Useful for latency and compliance.
* Cross-region queries become harder.

## 36. Sharding Tradeoffs

* Pros:

    * higher write scalability
    * higher storage capacity
    * better isolation between tenants

* Cons:

    * operational complexity
    * cross-shard joins are hard
    * cross-shard transactions are hard
    * rebalancing shards is hard
    * global secondary indexes are hard

## 37. Scaling PostgreSQL

* Scale vertically:

    * bigger CPU
    * more RAM
    * faster disk
    * better IOPS

* Scale reads:

    * read replicas
    * caching
    * query optimization
    * indexes
    * materialized views

* Scale writes:

    * batch writes
    * reduce indexes
    * partition large tables
    * use connection pooling
    * move high-volume events to Kafka/ClickHouse/Cassandra
    * shard only if necessary

## 38. Connection Pooling

* PostgreSQL creates one backend process per connection.

* Too many connections can hurt performance.

* Use connection pooling for high-traffic systems.

* Common pooling tools:

    * PgBouncer
    * application-level connection pools

## 39. Why Connection Pooling Matters

* Without pooling:

    * thousands of app connections can overload PostgreSQL
    * memory usage increases
    * context switching increases

* With pooling:

    * fewer database connections are reused
    * better throughput
    * lower overhead

## 40. Caching With PostgreSQL

* PostgreSQL can be combined with Redis.

```md
Client
  -> Service
  -> Redis Cache
  -> PostgreSQL
```

* Use Redis for:

    * frequently accessed data
    * session data
    * rate limits
    * counters
    * expensive query results

* Keep PostgreSQL as source of truth.

## 41. Cache-Aside Pattern

```md
Read request
  -> check Redis
  -> if cache hit, return data
  -> if cache miss, read PostgreSQL
  -> store result in Redis with TTL
  -> return data
```

* Good for read-heavy systems.
* Common in HLD interviews.

## 42. Materialized Views

* Materialized view stores precomputed query results.
* Useful for expensive aggregations.

```sql
CREATE MATERIALIZED VIEW daily_order_stats AS
SELECT 
    DATE(created_at) AS day,
    COUNT(*) AS total_orders,
    SUM(amount_cents) AS total_amount
FROM orders
GROUP BY DATE(created_at);
```

* Useful for dashboards with moderate data.
* Needs refresh.
* Not ideal for real-time analytics at massive scale.

## 43. PostgreSQL vs OLAP Databases

* PostgreSQL is row-oriented.

* Good for transactional queries.

* Not ideal for scanning billions of rows for analytics.

* ClickHouse is column-oriented.

* Good for analytical queries.

* Not ideal for transactional updates.

## 44. PostgreSQL vs Cassandra

* PostgreSQL:

    * strong consistency
    * transactions
    * SQL
    * joins
    * relational data

* Cassandra:

    * high write throughput
    * horizontal scalability
    * eventual consistency
    * query-driven modeling
    * no joins

## 45. PostgreSQL vs Redis

* PostgreSQL:

    * durable source of truth
    * stores structured relational data
    * supports transactions

* Redis:

    * in-memory cache
    * very low latency
    * supports TTL and counters
    * not ideal as primary durable database for critical data

## 46. PostgreSQL vs Elasticsearch

* PostgreSQL:

    * source of truth
    * transactional data
    * structured queries

* Elasticsearch:

    * full-text search
    * ranking
    * filtering
    * autocomplete
    * log search

## 47. PostgreSQL vs ClickHouse

* PostgreSQL:

    * OLTP
    * row-level operations
    * transactions
    * consistent updates

* ClickHouse:

    * OLAP
    * columnar scans
    * aggregations over huge event data
    * dashboards and analytics

## 48. Performance Numbers

* These are rough interview numbers, not guarantees.

* Simple indexed primary-key lookup:

    * usually single-digit milliseconds

* Simple indexed query:

    * usually single-digit to tens of milliseconds

* Complex join on large tables:

    * tens to hundreds of milliseconds or more

* Write throughput:

    * can handle thousands to tens of thousands of writes per second depending on hardware, schema, indexes, transaction size, and durability settings

* Connection count:

    * avoid thousands of direct application connections
    * use connection pooling

* Table size:

    * can handle very large tables
    * performance depends heavily on indexes, partitioning, query patterns, and hardware

## 49. Common Bottlenecks

* Missing indexes.
* Too many indexes.
* Slow joins.
* Large table scans.
* Deep offset pagination.
* Too many connections.
* Long-running transactions.
* Lock contention.
* Vacuum issues.
* Hot rows.
* Replication lag.
* Disk I/O bottleneck.
* Poor query plans.

## 50. Hot Row Problem

* A hot row is a row updated very frequently.

### Example

```sql
UPDATE posts
SET like_count = like_count + 1
WHERE id = 123;
```

* If one post gets millions of likes, this row becomes a bottleneck.

### Solutions

* Use Redis counters.
* Use sharded counters.
* Batch updates.
* Use event-based aggregation.
* Store raw events in Kafka/ClickHouse and update summary asynchronously.

## 51. Locking

* PostgreSQL uses locks to protect data correctness.
* Row-level locks are common during updates.
* Long transactions can hold locks for too long.
* Lock contention reduces throughput.

## 52. Deadlocks

* Deadlock happens when two transactions wait for each other.

### Example

```md
Transaction 1:
  locks row A
  waits for row B

Transaction 2:
  locks row B
  waits for row A
```

* PostgreSQL detects deadlocks and aborts one transaction.
* Application should retry aborted transaction.

## 53. Idempotency

* PostgreSQL is useful for idempotency keys.

### Example

```sql
CREATE TABLE idempotency_keys (
    key TEXT PRIMARY KEY,
    request_hash TEXT NOT NULL,
    response JSONB,
    status TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

* Useful in:

    * payment APIs
    * order creation
    * booking APIs
    * retry-safe workflows

## 54. Booking System Example

* PostgreSQL is a good fit for seat booking.

### Schema

```sql
CREATE TABLE seats (
    id BIGSERIAL PRIMARY KEY,
    show_id BIGINT NOT NULL,
    seat_number TEXT NOT NULL,
    status TEXT NOT NULL,
    UNIQUE(show_id, seat_number)
);

CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    show_id BIGINT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Booking Transaction

```sql
BEGIN;

UPDATE seats
SET status = 'BOOKED'
WHERE show_id = 101
AND seat_number = 'A1'
AND status = 'AVAILABLE';

INSERT INTO bookings(user_id, show_id, status)
VALUES (123, 101, 'CONFIRMED');

COMMIT;
```

* Important:

    * only one user should book a seat
    * transaction ensures correctness
    * unique constraints prevent duplicate booking

## 55. URL Shortener Example

* PostgreSQL can store URL metadata.

```sql
CREATE TABLE urls (
    id BIGSERIAL PRIMARY KEY,
    short_code TEXT NOT NULL UNIQUE,
    long_url TEXT NOT NULL,
    user_id BIGINT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_urls_short_code
ON urls(short_code);
```

* Read path:

    * check Redis cache
    * if miss, query PostgreSQL by short_code
    * return long_url
    * asynchronously publish click event to Kafka

* PostgreSQL stores metadata.

* ClickHouse stores analytics.

* Redis stores hot short_code mappings.

## 56. Payment System Example

* PostgreSQL is good for payment metadata and ledger entries.

```sql
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    payment_id TEXT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    amount_cents BIGINT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE ledger_entries (
    id BIGSERIAL PRIMARY KEY,
    payment_id TEXT NOT NULL,
    account_id BIGINT NOT NULL,
    entry_type TEXT NOT NULL,
    amount_cents BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

* Use transactions for:

    * payment state changes
    * ledger entry creation
    * idempotency key insertion

## 57. Outbox Pattern

* Outbox pattern is used to reliably publish events after database changes.

## 58. Why Outbox Pattern is Needed

* Problem:

    * service updates PostgreSQL
    * service publishes event to Kafka
    * one succeeds and the other fails

* This can cause inconsistency.

## 59. Outbox Pattern Flow

```md
Transaction:
  -> update business table
  -> insert event into outbox table
  -> commit

Background worker:
  -> reads unpublished outbox events
  -> publishes to Kafka
  -> marks event as published
```

## 60. Outbox Table Example

```sql
CREATE TABLE outbox_events (
    id BIGSERIAL PRIMARY KEY,
    aggregate_type TEXT NOT NULL,
    aggregate_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

* Useful in:

    * order systems
    * payment systems
    * notification systems
    * inventory systems

## 61. Schema Design Guidelines

* Use BIGSERIAL or UUID for primary keys.
* Add created_at and updated_at.
* Use foreign keys when consistency is important.
* Use constraints to protect data correctness.
* Add indexes based on query patterns.
* Avoid over-normalization if it causes too many joins.
* Avoid under-normalization if it causes inconsistent duplicate data.
* Keep high-volume event data separate from core transactional tables.

## 62. Normalization

* Normalization reduces duplicate data.
* Good for correctness.
* Useful when data is updated frequently.

### Example

* users table stores user data.
* orders table stores order data.
* orders.user_id references users.id.

## 63. Denormalization

* Denormalization duplicates data for faster reads.
* Useful when reads are very frequent.
* Can create consistency issues.

### Example

* Store user_name inside orders table to avoid joining users for order history.

## 64. Soft Deletes

* Soft delete means marking a row as deleted instead of physically deleting it.

```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;
```

* Useful when:

    * audit trail is needed
    * restore is needed
    * compliance requires history

* Downside:

    * queries need to filter deleted rows
    * indexes may grow
    * data cleanup becomes harder

## 65. Multi-Tenant Design

### Shared Table

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

* Add tenant_id to every table.
* Add indexes starting with tenant_id.

```sql
CREATE INDEX idx_orders_tenant_user
ON orders(tenant_id, user_id);
```

### Database Per Tenant

* Better isolation.
* Harder operations.
* Useful for large enterprise tenants.

## 66. Security

* Use least privilege database users.
* Use parameterized queries.
* Avoid SQL injection.
* Encrypt data in transit.
* Encrypt backups.
* Avoid storing sensitive data unless required.
* Store passwords using secure password hashing, not plain text.

## 67. Observability

* Monitor:

    * query latency
    * slow queries
    * connection count
    * CPU usage
    * memory usage
    * disk usage
    * disk IOPS
    * replication lag
    * lock waits
    * deadlocks
    * cache hit ratio
    * vacuum issues

## 68. Common Interview Mistakes

* Using PostgreSQL for high-volume analytics events.
* Ignoring indexes.
* Adding too many indexes.
* Using offset pagination for deep pages.
* Sending all reads to primary.
* Ignoring replication lag.
* Ignoring connection pooling.
* Using PostgreSQL as a queue for massive workloads.
* Not thinking about backups.
* Not handling transaction retries.
* Not considering hot rows.
* Sharding too early.

## 69. Good Interview Phrases

* "PostgreSQL is the source of truth for transactional data."
* "I will use Redis as a cache in front of PostgreSQL for hot reads."
* "I will use read replicas to scale read-heavy traffic."
* "For read-after-write consistency, I will route critical reads to primary."
* "For high-volume analytics, I will not store raw events in PostgreSQL. I will publish events to Kafka and store them in ClickHouse."
* "For reliable event publishing, I will use the outbox pattern."
* "For deep pagination, I will use cursor-based pagination instead of offset pagination."
* "I will add indexes based on actual query patterns."
* "I will avoid sharding PostgreSQL until vertical scaling, indexing, replicas, caching, and partitioning are not enough."

## 70. Tradeoffs

### Pros

* Strong consistency.
* ACID transactions.
* SQL support.
* Joins.
* Mature ecosystem.
* Great default database.
* Good indexing support.
* Good for relational data.
* Good for correctness-heavy systems.

### Cons

* Write scaling is harder than NoSQL systems.
* Horizontal sharding is complex.
* Too many connections can hurt performance.
* Large analytical scans are expensive.
* High-volume event ingestion is not ideal.
* Requires careful indexing and query tuning.
* Replication lag can cause stale reads.

## 71. Alternatives

### MySQL

* Similar relational OLTP database.
* Also common in HLD interviews.
* Use when team already has MySQL expertise.

### Cassandra

* Better for massive write throughput.
* Better for horizontal scalability.
* Worse for joins and transactions.

### Redis

* Better for low-latency cache.
* Not a replacement for PostgreSQL as source of truth.

### ClickHouse

* Better for analytics and aggregations.
* Not suitable for transactional workloads.

### Elasticsearch

* Better for full-text search.
* Not ideal as source of truth.

### MongoDB

* Better when document model is more natural.
* Less strict relational modeling.
* Transactions and joins are not the main strength.

## 72. Interview Summary

* PostgreSQL is a relational OLTP database.
* Use it as the source of truth for structured transactional data.
* Best for systems that need transactions, consistency, SQL, joins, and constraints.
* Use Redis for caching hot data.
* Use read replicas for read scaling.
* Use partitioning for very large tables.
* Use Kafka and ClickHouse for high-volume analytics events.
* Avoid using PostgreSQL for massive event ingestion, full-text search at scale, or large OLAP workloads.
* Sharding PostgreSQL is possible but operationally complex.
* In HLD interviews, PostgreSQL is usually the safest default database unless scale or query patterns demand a specialized system.

```

