---
title: Redis
slug: redis
summary: Interview-focused guide to Redis data structures, caching patterns, persistence, replication, Sentinel, Cluster, memory design, failure handling, and capacity planning.
tags:
  - database
  - cache
  - distributed-systems
  - redis
difficulty: intermediate
---

# Redis

Redis is an in-memory data store that provides low-latency access to strings, hashes, lists, sets, sorted sets, streams and other specialized data structures.

Redis is commonly used as:

- A distributed cache.
- A session store.
- A rate limiter.
- A counter store.
- A leaderboard.
- A short-lived state store.
- A Pub/Sub broker.
- A lightweight stream-processing queue.
- A distributed coordination primitive.
- A primary database for selected workloads.

> **One-line interview definition:** Redis is an in-memory key-value and data-structure server optimized for very low-latency operations, with optional persistence, replication, high availability and sharding.

Redis is not automatically durable, strongly consistent or infinitely scalable. The correctness and availability of a Redis design depend on:

- The selected data structure.
- Key distribution.
- Persistence mode.
- Replication topology.
- Eviction policy.
- Failover mechanism.
- Retry behavior.
- Whether the workload uses standalone Redis, Sentinel or Redis Cluster.

---

# Why Redis Exists

## 1. The Problem Redis Solves

Disk-backed databases are optimized for durability, large datasets and flexible queries. Even when indexed, accessing them usually involves:

- Network latency.
- Query parsing and planning.
- Buffer-cache lookup.
- Locking or MVCC work.
- Disk access when data is not cached.
- Serialization and result processing.

Many online paths repeatedly access a small hot working set:

```text
session
product details
feature flags
rate-limit counters
feed pages
leaderboard ranks
temporary tokens
```

Keeping this state in memory and exposing specialized operations can reduce latency and offload the primary database.

Redis provides:

- Memory-speed reads and writes.
- Atomic commands.
- Server-side data structures.
- Expiration.
- Eviction.
- Optional disk persistence.
- Primary-replica replication.
- Automatic failover.
- Horizontal sharding with Redis Cluster.


<!-- IMAGE PLACEHOLDER
Title: Redis in a typical application architecture
What to use: A request-flow diagram showing application servers checking Redis first, falling back to a primary database on a miss, then populating Redis. Include a low-latency cache-hit path and a slower cache-miss path.
Preferred source: Redis official documentation, “Client-side caching” or caching use-case pages; use an original diagram if no suitable official image exists.
Search terms: site:redis.io/docs Redis cache application database architecture cache aside
Purpose: Immediately show where Redis sits in an HLD and why it reduces database load.
Alt text: Application servers read from Redis, fall back to the database on a cache miss, and populate the cache.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 2. Redis Is More Than a Cache

A basic cache supports:

```text
key -> opaque value
```

Redis supports operations on the value itself:

```text
INCR a counter
add an item to a set
increment a leaderboard score
push an item to a list
claim a stream message
expire a session
atomically set a lock if absent
```

The operation occurs on the server, avoiding the unsafe pattern:

```text
GET value
modify in application
SET value
```

Atomic server-side operations are the main reason Redis is useful beyond simple caching.

---

# When to Use Redis

## 3. Good Use Cases

Redis is a good fit when most of the following are true:

- The active dataset fits in memory or can be sharded across memory.
- Millisecond or sub-millisecond server processing is valuable.
- Access is primarily by key.
- Data has a natural expiration time.
- Atomic counters or conditional writes are required.
- Data structures such as sorted sets, sets or streams simplify the design.
- Losing a small amount of recent data is acceptable, or persistence is configured and tested.
- The system can tolerate asynchronous replication semantics.
- The workload has a high read/write rate but simple query patterns.

Typical use cases:

- Cache.
- User sessions.
- API rate limiting.
- Login attempt tracking.
- OTP storage.
- Shopping-cart cache.
- Idempotency keys.
- Distributed locks with bounded guarantees.
- Real-time counters.
- Leaderboards.
- Presence and heartbeat tracking.
- Delayed-job indexes.
- Deduplication windows.
- Pub/Sub notifications.
- Stream consumer groups.
- Geospatial proximity lookup.
- Approximate cardinality using HyperLogLog.

## 4. When Not to Use Redis

Avoid Redis as the only system of record when the workload mainly requires:

- Complex joins.
- Arbitrary filtering.
- Large historical datasets that do not fit economically in memory.
- Multi-row relational transactions.
- Strict durability with zero acknowledged-write loss.
- Strongly consistent cross-shard operations.
- Long analytical scans.
- Large files or blobs.
- Exactly-once messaging.
- Financial ledgers.
- Globally exclusive decisions that require consensus.
- Queries across arbitrary dimensions.

Examples:

| Requirement | Better starting choice |
|---|---|
| Financial ledger | PostgreSQL or another transactional database |
| Large durable event history | Cassandra, object storage or a log system |
| Ad-hoc analytics | ClickHouse, BigQuery or a warehouse |
| Durable event streaming | Kafka |
| Full-text search | Elasticsearch, OpenSearch or Redis Search when Redis is already justified |
| Small CRUD application | PostgreSQL |
| Hot cache and counters | Redis |

## 5. Redis as Cache vs Primary Store

### Redis as a cache

The source of truth exists elsewhere.

```text
Redis loss -> rebuild from database
```

Typical choices:

- Eviction enabled.
- TTL used heavily.
- Persistence may be disabled.
- Availability is prioritized.
- Data loss is acceptable because values can be reloaded.

### Redis as a primary store

Redis contains data that cannot simply be recomputed.

```text
Redis loss -> business data loss
```

Required considerations:

- Persistence.
- Backups.
- Replication.
- Failover data-loss window.
- `maxmemory` and `noeviction`.
- Recovery testing.
- Whether Redis durability is sufficient for the business requirement.

### Redis as a derived state store

The authoritative event exists in Kafka or a database, while Redis contains a materialized real-time view.

```text
events -> processor -> Redis
```

This is often safer than treating Redis as the permanent source of truth.

---


<!-- IMAGE PLACEHOLDER
Title: Three roles of Redis
What to use: A three-column comparison diagram: Redis as rebuildable cache, Redis as primary in-memory store, and Redis as a derived materialized view fed by events. Show the source of truth, persistence choice, eviction choice, and recovery path for each role.
Preferred source: Redis official documentation, “Redis persistence”, “Key eviction”, and architecture/use-case pages.
Search terms: site:redis.io/docs Redis cache primary database derived state persistence eviction
Purpose: Prevent readers from treating every Redis deployment as having the same durability and correctness requirements.
Alt text: Redis used as a cache, primary data store, or derived real-time view, each with different recovery and eviction behavior.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
# Redis Mental Model

## 6. Server, Database, Key and Value

A Redis deployment contains:

- **Server/process:** A Redis instance.
- **Logical database:** A numbered keyspace in standalone Redis.
- **Key:** A binary-safe identifier.
- **Value:** A Redis data structure.
- **TTL:** Optional expiration associated with the key.
- **Client:** An application connection using RESP.
- **Primary:** The writable leader of a replication group.
- **Replica:** An asynchronously replicated copy.
- **Shard:** A subset of keys in Redis Cluster.
- **Hash slot:** The routing unit used by Redis Cluster.

Redis Cluster supports only logical database `0`. Application isolation should use separate clusters or key prefixes rather than relying on numbered databases.

## 7. Command Execution Model

Redis is commonly described as single-threaded.

The important interview interpretation is:

- Command execution for the core keyspace is serialized.
- One command does not interleave its data-structure mutation with another command.
- Atomic commands do not require application-side locks.
- A slow command can delay unrelated clients on the same server or shard.
- Network I/O and background work may use additional threads or child processes depending on configuration and Redis version.

Do not conclude:

```text
Single-threaded = slow.
```

In-memory operations, efficient data structures and the absence of command-level lock contention make Redis capable of high throughput. The main limits are often:

- Network round trips.
- Command complexity.
- Value size.
- One hot shard.
- Persistence overhead.
- Memory bandwidth.
- Serialization.
- Client concurrency.


<!-- IMAGE PLACEHOLDER
Title: Redis command execution and event loop
What to use: A timeline showing multiple client connections feeding commands into one Redis shard, commands executing sequentially, and background activities such as networking, persistence, and replication shown separately. Highlight how one slow command delays later commands.
Preferred source: Redis official documentation, “Redis architecture”, command processing, and latency diagnostics pages.
Search terms: site:redis.io/docs Redis single threaded command execution event loop slow command latency
Purpose: Explain atomic command execution and why an expensive command affects unrelated clients on the same shard.
Alt text: Multiple clients submit commands to a Redis shard, which executes core commands sequentially while background work occurs separately.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 8. Atomicity of a Redis Command

A single Redis command is atomic from the perspective of other clients.

Example:

```text
INCR rate:user:123
```

Two clients cannot read the same old value and both independently overwrite it.

Unsafe application-side pattern:

```text
value = GET counter
value = value + 1
SET counter value
```

Safe Redis operation:

```text
INCR counter
```

Atomic does not necessarily mean durable. A command can be atomic in memory and still be lost during a crash or failover depending on persistence and replication.


<!-- IMAGE PLACEHOLDER
Title: Atomic INCR versus unsafe read-modify-write
What to use: A side-by-side sequence diagram. Left: two clients perform GET, local increment, SET and lose an update. Right: both clients use INCR and Redis serializes the increments correctly.
Preferred source: Redis official command documentation for GET, SET, and INCR; create an original sequence diagram.
Search terms: site:redis.io/docs INCR atomic Redis race condition GET SET
Purpose: Make Redis command atomicity concrete with a common lost-update example.
Alt text: Unsafe GET-modify-SET loses an update, while atomic INCR correctly applies both client increments.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 9. RESP and Client Connections

Redis clients communicate using the Redis Serialization Protocol.

The application normally uses a client library that provides:

- Connection pooling or multiplexing.
- Pipelining.
- Reconnection.
- Cluster-slot discovery.
- `MOVED` and `ASK` handling.
- Sentinel primary discovery.
- Command timeout configuration.
- Serialization.

Client behavior is part of the system design. A poorly configured client can cause:

- Connection storms.
- Retry storms.
- Excessive round trips.
- Routing through the wrong node.
- Cross-slot errors.
- Stale reads from replicas.
- Output-buffer growth.

---

# Key Design

## 10. Key Naming

Use predictable, namespaced keys.

```text
user:123:profile
session:8f2a...
rate:user:123:minute:202607111630
leaderboard:game:42
idempotency:merchant:99:req:abc
```

A common pattern is:

```text
<domain>:<entity-id>:<purpose>
```

Good key names:

- Avoid collisions.
- Make debugging easier.
- Support operational sampling.
- Clarify ownership.
- Support Redis Cluster hash tags when required.

Do not make keys excessively long. Key bytes are stored for every entry and consume memory.


<!-- IMAGE PLACEHOLDER
Title: Redis key anatomy and namespace conventions
What to use: A labelled key example such as tenant:123:user:456:session, breaking it into domain, tenant, entity, identifier, purpose, and optional time bucket. Include good and bad key-name examples.
Preferred source: Redis official key and data-type documentation; create an original key-anatomy graphic.
Search terms: site:redis.io/docs Redis key naming convention key prefixes
Purpose: Teach predictable key design and show that key bytes also consume memory.
Alt text: A Redis key split into namespace, tenant, entity identifier, and purpose components.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 11. Avoid Unbounded Key Cardinality

A design may have small values but still exhaust memory through millions of keys.

Estimate:

```text
total memory
≈ key count
× (key bytes + value bytes + Redis overhead + allocator overhead)
```

A TTL does not prevent a burst from temporarily creating too many keys.

Examples:

- One key per request for seven days.
- One lock key per task without cleanup.
- One idempotency key retained forever.
- One presence key per connection without expiry.

Always define:

- Expected key count.
- Peak key creation rate.
- TTL.
- Cleanup behavior.
- Memory per key.
- Shard distribution.

## 12. Hash Tags in Redis Cluster

Redis Cluster normally hashes the complete key.

A substring inside `{}` can force related keys into the same hash slot.

```text
user:{123}:profile
user:{123}:cart
user:{123}:preferences
```

Only `123` is used for slot calculation.

This enables:

- Multi-key commands.
- Transactions.
- Lua scripts.
- Functions.

across those keys in Redis Cluster.

Trade-off:

```text
Too broad a hash tag -> hot slot.
```

Bad:

```text
{all-users}:user:1
{all-users}:user:2
```

Every key lands on one shard.

---


<!-- IMAGE PLACEHOLDER
Title: Redis Cluster hash tags
What to use: A diagram showing user:{123}:profile, user:{123}:cart, and user:{123}:preferences mapping to the same hash slot because only 123 inside braces is hashed. Contrast with unrelated keys distributed across different slots.
Preferred source: Redis official documentation, “Scale with Redis Cluster” and “Redis Cluster specification”.
Search terms: site:redis.io/docs Redis Cluster hash tags same slot multi key
Purpose: Explain how hash tags enable same-slot multi-key operations and how overuse creates hotspots.
Alt text: Keys sharing the same hash tag map to one Redis Cluster slot while other keys distribute across shards.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
# Core Data Structures

## 13. Strings

A string stores:

- Text.
- Serialized JSON.
- Binary data.
- Integer.
- Floating-point value.
- Bit array.

Common commands:

```text
GET
SET
MGET
MSET
INCR
INCRBY
DECR
APPEND
GETRANGE
SETRANGE
SETNX
```

Examples:

```text
SET session:abc '{"userId":123}' EX 1800
INCR page:home:views
SET idempotency:req-1 result NX EX 86400
```

Use strings for:

- Cache entries.
- Counters.
- Tokens.
- Locks.
- Small serialized objects.
- Feature flags.

Avoid repeatedly reading and rewriting a large serialized object to modify one field. Use a hash or split the object if partial updates are common.


<!-- IMAGE PLACEHOLDER
Title: Redis core data structures overview
What to use: A single infographic containing string, hash, list, set, sorted set, stream, bitmap, HyperLogLog, and geospatial structures. For each, show its logical shape and one typical HLD use case.
Preferred source: Redis official documentation, “Redis data types” and “Compare data types”.
Search terms: site:redis.io/docs latest develop data types Redis strings hashes lists sets sorted sets streams
Purpose: Give readers a visual map before they study each data structure separately.
Alt text: Overview of Redis data structures with their logical shapes and typical use cases.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 14. Hashes

A hash stores field-value pairs under one Redis key.

```text
HSET user:123 name "Vishnu" country "IN" plan "premium"
HGET user:123 plan
HMGET user:123 name plan
HINCRBY user:123 login_count 1
```

Use hashes for:

- User profile cache.
- Shopping-cart attributes.
- Object fields.
- Counters grouped by entity.
- Compact storage of many small related values.

Advantages:

- Partial field reads and writes.
- One key for related fields.
- Atomic field increments.

Limitations:

- TTL generally applies to the key as a whole.
- Very large hashes become big keys.
- Querying all hashes by a field is not a basic Redis operation.
- A hash is not a relational table.


<!-- IMAGE PLACEHOLDER
Title: String object versus Redis hash
What to use: A side-by-side diagram comparing one serialized JSON string that must be rewritten for a field change with a Redis hash that updates one field using HSET or HINCRBY.
Preferred source: Redis official documentation, “Redis strings” and “Redis hashes”.
Search terms: site:redis.io/docs Redis strings hashes partial field update diagram
Purpose: Help readers choose between opaque serialized objects and field-addressable hashes.
Alt text: A serialized string requires whole-value replacement while a Redis hash supports individual field updates.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 15. Lists

A list is an ordered sequence of strings.

Common commands:

```text
LPUSH
RPUSH
LPOP
RPOP
LRANGE
BLPOP
BRPOP
LMOVE
BLMOVE
```

Use lists for:

- Small queues.
- Recent items.
- Work distribution where simple pop semantics are sufficient.
- Bounded activity history.

Bounded recent list:

```text
LPUSH user:123:recent-searches "redis"
LTRIM user:123:recent-searches 0 99
```

Limitations:

- Index access away from the ends can be expensive.
- No durable consumer acknowledgement.
- A popped task may be lost if the worker crashes.
- Large lists become big keys.
- Kafka or Redis Streams is better for durable message processing.


<!-- IMAGE PLACEHOLDER
Title: Redis list as stack and queue
What to use: A deque-style diagram showing LPUSH/RPOP queue behavior, LPUSH/LPOP stack behavior, and blocking consumers with BLPOP or BRPOP. Add a warning that a popped job can be lost if a worker crashes.
Preferred source: Redis official documentation, “Redis lists”.
Search terms: site:redis.io/docs Redis lists LPUSH RPOP BLPOP queue diagram
Purpose: Visualize list-end operations and introduce the reliability limitation of simple list queues.
Alt text: Redis list supports stack and queue operations from both ends, with blocking consumers.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 16. Sets

A set stores unique unordered members.

Common commands:

```text
SADD
SREM
SISMEMBER
SMEMBERS
SCARD
SINTER
SUNION
SDIFF
SPOP
```

Use sets for:

- Unique tags.
- Membership.
- Online-user IDs.
- Deduplication.
- Mutual friends.
- Feature membership.
- Access-control membership.

Example:

```text
SADD post:55:liked-users user:123
SISMEMBER post:55:liked-users user:123
SCARD post:55:liked-users
```

Be careful with:

```text
SMEMBERS huge-set
```

It returns the entire set and can block the server and overload the network. Use incremental scanning when full enumeration is unavoidable.


<!-- IMAGE PLACEHOLDER
Title: Redis set operations
What to use: A Venn diagram showing SINTER, SUNION, and SDIFF for two user or tag sets. Include SISMEMBER and SCARD as direct operations.
Preferred source: Redis official documentation, “Redis sets”.
Search terms: site:redis.io/docs Redis sets intersection union difference diagram
Purpose: Make set membership and relational set operations easy to remember.
Alt text: Two Redis sets demonstrate intersection, union, difference, membership, and cardinality.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 17. Sorted Sets

A sorted set stores unique members ordered by numeric score.

Common commands:

```text
ZADD
ZINCRBY
ZRANK
ZREVRANK
ZRANGE
ZREVRANGE
ZRANGEBYSCORE
ZREM
ZCARD
ZPOPMIN
ZPOPMAX
```

Use sorted sets for:

- Leaderboards.
- Priority queues.
- Delayed jobs.
- Sliding-window rate limiting.
- Time-ordered indexes.
- Trending scores.

Leaderboard:

```text
ZINCRBY leaderboard:game:42 20 user:123
ZREVRANK leaderboard:game:42 user:123
ZREVRANGE leaderboard:game:42 0 99 WITHSCORES
```

Delayed jobs:

```text
score = execution timestamp
member = job ID
```

Workers query due jobs by score.

Limitations:

- Scores are floating-point numbers.
- Members must be unique.
- One global leaderboard can become a hot key.
- Removing millions of old entries in one command can be expensive.
- Cross-shard global rankings require an additional aggregation strategy.


<!-- IMAGE PLACEHOLDER
Title: Sorted set leaderboard
What to use: A leaderboard diagram with members ordered by score, showing ZADD/ZINCRBY updates, ZREVRANK for one player, and ZREVRANGE for the top 100.
Preferred source: Redis official documentation, “Redis sorted sets”.
Search terms: site:redis.io/docs Redis sorted sets leaderboard ZINCRBY ZREVRANK diagram
Purpose: Connect sorted-set ordering to one of Redis’s most common interview use cases.
Alt text: Players are ordered by numeric score in a Redis sorted set and queried by rank.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 18. Streams

A Redis Stream is an append-only log-like data structure.

Common commands:

```text
XADD
XRANGE
XREAD
XGROUP CREATE
XREADGROUP
XACK
XPENDING
XCLAIM
XAUTOCLAIM
XTRIM
```

Use Streams for:

- Event ingestion.
- Work queues with acknowledgement.
- Consumer groups.
- Short-lived event history.
- Real-time processing.

Example:

```text
XADD orders * order_id 123 status CREATED
```

Consumer group:

```text
XGROUP CREATE orders workers 0 MKSTREAM
XREADGROUP GROUP workers worker-1 COUNT 10 BLOCK 5000 STREAMS orders >
XACK orders workers <message-id>
```

Streams provide:

- Ordered IDs.
- Retained messages.
- Consumer groups.
- Pending-entry tracking.
- Claiming abandoned work.
- Trimming.

Redis Streams are not a full Kafka replacement for every workload. Kafka is usually better when the system needs:

- Very long retention.
- Large disk-backed logs.
- High partitioned throughput.
- Replay by many independent consumer groups.
- Strong ecosystem for stream processing.
- Storage larger than memory.


<!-- IMAGE PLACEHOLDER
Title: Redis Stream append-only log
What to use: A horizontal stream containing ordered entry IDs and field-value pairs, with multiple readers and a consumer group. Show XADD, XREAD, XREADGROUP, XACK, and trimming.
Preferred source: Redis official documentation, “Redis Streams”.
Search terms: site:redis.io/docs Redis Streams XADD XREADGROUP XACK consumer group diagram
Purpose: Introduce streams visually before the detailed consumer-group section.
Alt text: Redis Stream entries are appended in order and consumed directly or through acknowledged consumer groups.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 19. Bitmaps

Bitmaps use string values as arrays of bits.

Common commands:

```text
SETBIT
GETBIT
BITCOUNT
BITOP
BITPOS
```

Use for compact boolean state:

```text
user 123 active on day 42
feature X enabled for account 99
daily attendance
```

Example:

```text
SETBIT active:2026-07 user_numeric_id 1
BITCOUNT active:2026-07
```

Bitmaps are memory efficient when IDs are dense.

Bad fit:

```text
IDs are sparse UUID-derived integers.
```

Setting a far-away bit can allocate a very large string.


<!-- IMAGE PLACEHOLDER
Title: Compact and probabilistic Redis structures
What to use: A four-part infographic showing a bitmap for daily activity, HyperLogLog for approximate unique users, Bloom filter for membership screening, and geospatial index for nearby locations.
Preferred source: Redis official documentation, “Bitmaps”, “HyperLogLog”, “Probabilistic data types”, and geospatial commands.
Search terms: site:redis.io/docs Redis bitmap HyperLogLog Bloom filter geospatial overview
Purpose: Show when specialized compact structures save memory compared with ordinary sets or objects.
Alt text: Redis compact structures represent boolean activity, approximate cardinality, probabilistic membership, and nearby locations.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 20. Bitfields

Bitfields allow integer operations on ranges of bits inside a string.

Use for compact packed counters such as:

```text
small per-user counters
limited-range status values
game state
```

The memory savings can be significant, but the design is harder to understand and evolve. Use only when memory pressure justifies the complexity.

## 21. HyperLogLog

HyperLogLog estimates cardinality using small fixed memory.

Common commands:

```text
PFADD
PFCOUNT
PFMERGE
```

Use for approximate:

- Daily active users.
- Unique visitors.
- Unique search queries.
- Unique devices.

Example:

```text
PFADD dau:2026-07-11 user:123
PFCOUNT dau:2026-07-11
```

Use a set when exact membership and exact count are required. Use HyperLogLog when a small estimation error is acceptable and only cardinality matters.

## 22. Geospatial Indexes

Redis geospatial commands store locations using a sorted-set-based representation.

Common commands:

```text
GEOADD
GEOSEARCH
GEODIST
GEOPOS
```

Use for:

- Nearby drivers.
- Nearby stores.
- Service locations.
- Approximate radius queries.

Redis geospatial indexing is useful for online proximity lookup. It is not a complete GIS database and does not replace complex polygon or route queries.

## 23. JSON, Search, Time Series and Probabilistic Types

Modern Redis distributions can provide additional capabilities such as:

- JSON documents.
- Search and secondary indexing.
- Time-series data.
- Bloom filters.
- Cuckoo filters.
- Count-min sketch.
- Top-K.
- Vector-oriented structures.

Use them when Redis is already justified by latency and operational requirements.

Do not select Redis solely because it can technically support a query that a specialized database handles more naturally.

---

# Command Complexity

## 24. Why Complexity Matters

Redis serializes command execution on each server or shard. An expensive command delays other clients.

Prefer commands whose work is bounded by:

- One key.
- A small number of members.
- A small result limit.
- Incremental scanning.

Potentially dangerous patterns:

```text
KEYS *
SMEMBERS on a huge set
HGETALL on a huge hash
LRANGE 0 -1 on a huge list
ZRANGE returning millions of members
large set intersections
deleting a huge key synchronously
Lua loops over unbounded data
```


<!-- IMAGE PLACEHOLDER
Title: One slow command blocks a Redis shard
What to use: A command timeline where several fast GET/SET operations queue behind an expensive SMEMBERS, KEYS, huge ZRANGE, or long Lua script. Annotate command complexity and response size.
Preferred source: Redis official command reference and “Diagnosing latency issues”.
Search terms: site:redis.io/docs Redis slow command KEYS SMEMBERS latency blocking
Purpose: Explain why in-memory does not make unbounded commands safe.
Alt text: Fast Redis commands wait behind one unbounded command on the same shard.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 25. `SCAN` vs `KEYS`

`KEYS pattern` traverses the keyspace in one command and can block the server.

`SCAN` incrementally iterates with a cursor.

```text
SCAN 0 MATCH session:* COUNT 1000
```

`SCAN` characteristics:

- Does not return a stable point-in-time snapshot.
- May return duplicates.
- Requires repeated calls until the cursor returns to `0`.

Use `SCAN` for administration, not as a normal online query path.

## 26. Bounded Results

Bad:

```text
ZRANGE global-leaderboard 0 -1
```

Better:

```text
ZREVRANGE global-leaderboard 0 99 WITHSCORES
```

The output size is part of command complexity.

---

# Expiration and TTL

## 27. Key Expiration

Redis can expire keys automatically.

```text
SET otp:user:123 abc123 EX 300
EXPIRE session:abc 1800
PEXPIRE lock:job:1 10000
TTL session:abc
PTTL lock:job:1
```

Use TTL for:

- Cache entries.
- Sessions.
- OTPs.
- Locks.
- Rate-limit windows.
- Idempotency records.
- Presence.
- Deduplication windows.
- Temporary workflow state.


<!-- IMAGE PLACEHOLDER
Title: Redis TTL lifecycle
What to use: A lifecycle diagram: key creation with TTL, TTL countdown, access before expiry, passive expiration on access, active expiration sampling, and key removal. Distinguish logical expiry from exact scheduler execution.
Preferred source: Redis official documentation for EXPIRE and key expiration behavior.
Search terms: site:redis.io/docs Redis key expiration active passive expiration TTL lifecycle
Purpose: Explain that TTL controls key lifetime but does not provide an exact durable timer.
Alt text: A Redis key counts down to expiry and is removed through passive or active expiration.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 28. Expiration Is Not a Scheduler

A key expiring does not mean an application receives an exactly timed durable event.

Redis removes expired keys through:

- Passive expiration when the key is accessed.
- Active expiration cycles that sample and remove expired keys.

Do not use key expiration alone for:

```text
Execute payment exactly at 10:00:00.
```

Use a durable scheduler or delayed-job design.

## 29. Sliding TTL

Session refresh:

```text
GET session:abc
EXPIRE session:abc 1800
```

Potential issue:

```text
GET succeeds, process crashes before EXPIRE.
```

Use a transaction, script, function or command option when atomic refresh semantics matter.

## 30. TTL Jitter

If millions of keys receive the same TTL, they may expire together.

This can cause:

- Cache misses at the same moment.
- Database load spike.
- Active-expiry CPU spike.
- Refill storm.

Add random jitter:

```text
TTL = 3600 seconds + random(0, 300 seconds)
```

---


<!-- IMAGE PLACEHOLDER
Title: TTL jitter prevents synchronized expiry
What to use: Two time-series panels. First: one million keys all expire at the same second and backend traffic spikes. Second: random TTL jitter spreads expirations and smooths database load.
Preferred source: Redis caching guidance and original diagram based on expiration behavior.
Search terms: Redis TTL jitter cache avalanche diagram
Purpose: Show why identical TTL values can create an expiration and refill spike.
Alt text: Random TTL jitter spreads cache expirations and prevents a synchronized backend traffic surge.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
# Eviction

## 31. `maxmemory`

`maxmemory` limits memory used for the Redis dataset.

Do not set `maxmemory` equal to total machine RAM. Reserve memory for:

- Redis process overhead.
- Client buffers.
- Replication backlog.
- AOF buffers.
- Fork copy-on-write.
- Operating system.
- Memory fragmentation.
- Modules.
- Failover and resynchronization.

## 32. Eviction Policies

Common policies:

| Policy | Behavior |
|---|---|
| `noeviction` | Reject memory-growing writes when the limit is reached |
| `allkeys-lru` | Evict approximately least-recently-used keys |
| `allkeys-lfu` | Evict approximately least-frequently-used keys |
| `allkeys-random` | Evict random keys |
| `volatile-lru` | LRU among keys with TTL |
| `volatile-lfu` | LFU among keys with TTL |
| `volatile-random` | Random among keys with TTL |
| `volatile-ttl` | Evict TTL keys with the shortest remaining lifetime |


<!-- IMAGE PLACEHOLDER
Title: Redis eviction policies decision chart
What to use: A visual decision tree starting with “Is Redis only a cache?” and branching to allkeys-lru/allkeys-lfu, volatile policies, or noeviction. Include expiration versus eviction.
Preferred source: Redis official documentation, “Key eviction”.
Search terms: site:redis.io/docs Redis key eviction allkeys-lru allkeys-lfu noeviction diagram
Purpose: Help readers select an eviction policy based on whether data is rebuildable.
Alt text: Decision tree selects a Redis eviction policy for cache data, TTL-only data, or critical state.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 33. Which Policy to Choose

### Pure cache

Start with:

```text
allkeys-lru
```

or:

```text
allkeys-lfu
```

### Primary data store

Use:

```text
noeviction
```

An unexpected eviction would be data loss.

### Mixed cache and non-evictable state

Prefer separate Redis deployments:

```text
Redis A -> cache, eviction enabled
Redis B -> critical state, noeviction
```

## 34. Eviction Is Not Expiration

Expiration:

```text
Remove this key after its TTL.
```

Eviction:

```text
Remove a key because memory is full.
```

A key can be evicted before its TTL expires.

---

# Caching Patterns

## 35. Cache-Aside

Read flow:

```text
1. GET cache.
2. If hit, return value.
3. If miss, read database.
4. SET cache with TTL.
5. Return value.
```

Write flow:

```text
1. Update database.
2. Delete or update cache.
```

Advantages:

- Simple.
- Cache contains only requested data.
- Redis failure can fall back to the database.

Risks:

- Cache miss latency.
- Stale data.
- Stampede.
- Dual-write race.
- Database overload when Redis is unavailable.


<!-- IMAGE PLACEHOLDER
Title: Cache-aside read and write flows
What to use: Two sequence diagrams. Read: application GETs Redis, reads DB on miss, then SETs Redis. Write: application updates DB and invalidates the Redis key.
Preferred source: Redis caching use-case documentation; create an original sequence diagram.
Search terms: Redis cache aside read miss database invalidate diagram
Purpose: Present the default Redis caching pattern used in most HLD interviews.
Alt text: Cache-aside reads Redis first and fills it from the database on misses; writes update the database and invalidate cache.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 36. Read-Through

The application asks a cache layer for data. The cache layer loads the backing store on a miss.

Redis itself does not automatically understand an arbitrary source database. A library, proxy or application component implements the behavior.

## 37. Write-Through

The application writes through a cache layer, which synchronously updates the backing database.

Advantages:

- Cache is updated during the write.

Trade-offs:

- Higher write latency.
- Partial-failure handling.
- Cache and database atomicity remain difficult.

## 38. Write-Behind

The application writes Redis first. A background process writes to the database later.

Advantages:

- Very low write latency.
- Writes can be batched.

Risks:

- Data loss before database persistence.
- Ordering.
- Retry and deduplication.
- Backlog growth.
- Recovery complexity.

## 39. Refresh-Ahead

Frequently accessed keys are refreshed before expiration.

Advantages:

- Reduces user-facing misses.

Risks:

- Refreshing unused data.
- Additional background traffic.
- Coordination across refresh workers.

## 40. Cache Invalidation

Common strategies:

### Delete on write

```text
update database
DEL cache key
```

### Update on write

```text
update database
SET cache with new value
```

### Versioned keys

```text
user:123:v17
```

### Event-driven invalidation

```text
database change -> event -> cache invalidator
```


<!-- IMAGE PLACEHOLDER
Title: Cache invalidation strategies
What to use: A four-column comparison: delete-on-write, update-on-write, versioned keys, and event-driven invalidation. Show freshness, latency, and failure trade-offs.
Preferred source: Redis caching documentation and official client-side caching/invalidation pages.
Search terms: site:redis.io/docs Redis cache invalidation delete update versioned keys events
Purpose: Compare invalidation mechanisms without treating one as universally correct.
Alt text: Four cache invalidation strategies trade simplicity, freshness, and failure handling differently.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 41. Database-Then-Delete Race

Possible race:

```text
Reader misses old cache.
Reader reads old database value.
Writer updates database.
Writer deletes cache.
Reader writes old value into cache.
```

Mitigations:

- Short TTL.
- Version check.
- Delayed second delete.
- Change-data-capture invalidation.
- Accept bounded staleness.


<!-- IMAGE PLACEHOLDER
Title: Stale cache race during database update
What to use: A numbered sequence diagram with Reader and Writer showing: cache miss, old DB read, DB update, cache delete, and reader repopulating the old value after deletion.
Preferred source: Create an original diagram based on the cache-aside race described in this section.
Search terms: cache aside database then delete race stale cache sequence diagram
Purpose: Make the subtle stale-repopulation race understandable.
Alt text: A reader repopulates an old database value after a writer updates the database and deletes the cache key.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 42. Cache Stampede

Many requests miss the same hot key and all query the database.

Mitigations:

- Per-key lock.
- Request coalescing.
- Single-flight.
- Refresh-ahead.
- Soft TTL plus stale-while-revalidate.
- TTL jitter.
- Prewarming.


<!-- IMAGE PLACEHOLDER
Title: Cache stampede and single-flight protection
What to use: A before-and-after diagram. Before: hundreds of requests miss one hot key and all query the database. After: one loader fetches the value while other requests wait or receive stale data.
Preferred source: Redis caching guidance and original single-flight diagram.
Search terms: Redis cache stampede single flight request coalescing diagram
Purpose: Show how request coalescing protects the source database.
Alt text: Many cache misses collapse into one database load using single-flight coordination.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 43. Cache Penetration

Repeated requests for nonexistent values bypass the cache.

Mitigations:

- Negative caching.
- Bloom filter.
- Input validation.
- Rate limiting.
- Abuse detection.


<!-- IMAGE PLACEHOLDER
Title: Cache penetration and negative caching
What to use: A request flow for a nonexistent key repeatedly missing Redis and the database, followed by a protected flow using validation, Bloom filter, and short negative-cache entry.
Preferred source: Redis official probabilistic data-type documentation and caching guidance.
Search terms: Redis cache penetration negative caching Bloom filter diagram
Purpose: Explain protection against repeated requests for missing objects.
Alt text: Negative caching and a Bloom filter stop nonexistent-key requests from repeatedly reaching the database.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 44. Cache Avalanche

Many unrelated keys expire or Redis fails at once, sending a traffic burst to the database.

Mitigations:

- TTL jitter.
- Redis high availability.
- Circuit breakers.
- Database rate limits.
- Stale serving.
- Request shedding.
- Cache warming.


<!-- IMAGE PLACEHOLDER
Title: Cache avalanche failure cascade
What to use: A causal diagram: Redis outage or synchronized expirations -> cache miss surge -> database saturation -> application timeouts. Show defenses such as HA, jitter, stale serving, circuit breaker, and load shedding.
Preferred source: Redis high-availability and caching guidance; create an original failure-cascade diagram.
Search terms: Redis cache avalanche database overload circuit breaker diagram
Purpose: Show that Redis failure can cascade into a database outage without degraded-mode controls.
Alt text: A cache outage drives a miss surge into the database, while resilience controls break the failure cascade.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 45. Cache Hit Ratio

```text
hit ratio
= hits / (hits + misses)
```

Also inspect:

- Backend requests avoided.
- Hit ratio by key family.
- Eviction rate.
- Stale-read rate.
- Redis outage behavior.

A 99% hit ratio can still overload a database if total traffic is enormous.


---

# Persistence

## 46. Persistence Options

Redis Open Source supports:

- No persistence.
- RDB snapshots.
- AOF.
- RDB and AOF together.

The correct choice depends on Redis's role.

| Role | Common starting point |
|---|---|
| Rebuildable cache | No persistence |
| Session store | AOF every second or managed durable configuration |
| Derived materialized view | No persistence or snapshots, depending on rebuild time |
| Primary store | AOF plus backups; verify durability requirements carefully |
| Fast restart with bounded loss | RDB |
| Stronger recovery with compact backup | RDB + AOF |


<!-- IMAGE PLACEHOLDER
Title: Redis persistence modes
What to use: A comparison diagram for no persistence, RDB snapshots, AOF, and RDB plus AOF. Show write path, recovery source, typical loss window, and operational cost.
Preferred source: Redis official documentation, “Redis persistence”.
Search terms: site:redis.io/docs Redis persistence RDB AOF comparison diagram
Purpose: Give a visual overview before explaining each persistence mechanism.
Alt text: Redis persistence choices trade recovery completeness, write overhead, and restart behavior.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 47. RDB Snapshots

RDB creates a point-in-time snapshot.

Advantages:

- Compact file.
- Fast restart.
- Convenient backup.
- Lower steady-state write overhead than logging every command.

Trade-offs:

- Data after the last snapshot can be lost.
- Snapshot creation uses `fork`.
- Copy-on-write can temporarily increase memory usage.
- Fork latency can be noticeable on large datasets.
- Snapshot I/O can affect latency.

Example conceptual policy:

```text
snapshot every 5 minutes
maximum crash loss ≈ up to 5 minutes
```

Actual loss depends on snapshot completion and failure timing.


<!-- IMAGE PLACEHOLDER
Title: RDB snapshot timeline
What to use: A timeline showing normal writes, BGSAVE fork, child writing an RDB snapshot, crash, and recovery to the latest completed snapshot. Highlight the unsaved interval.
Preferred source: Redis official documentation, “Redis persistence”.
Search terms: site:redis.io/docs Redis RDB BGSAVE snapshot fork recovery timeline
Purpose: Visualize RDB’s point-in-time recovery and potential data-loss window.
Alt text: Redis recovers from the latest completed RDB snapshot and loses writes made afterward.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 48. AOF

AOF logs write operations and replays them during startup.

Fsync policies:

```text
appendfsync always
appendfsync everysec
appendfsync no
```

### `always`

- Fsync after write batches.
- Strongest AOF durability.
- Higher latency and lower throughput.

### `everysec`

- Fsync approximately every second.
- Common balance.
- A crash can lose roughly the most recent second of writes.

### `no`

- OS decides when to flush.
- Fastest.
- Larger data-loss window.

AOF is periodically rewritten to remove redundant historical operations.


<!-- IMAGE PLACEHOLDER
Title: AOF append, fsync and rewrite
What to use: A write-path diagram showing commands appended to AOF, fsync policies always/everysec/no, replay on restart, and background AOF rewrite compacting redundant history.
Preferred source: Redis official documentation, “Redis persistence” and BGREWRITEAOF command page.
Search terms: site:redis.io/docs Redis AOF appendfsync everysec rewrite replay diagram
Purpose: Explain how AOF differs from snapshots and why rewrite is required.
Alt text: Redis appends write commands to AOF, periodically fsyncs them, rewrites the log, and replays it during recovery.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 49. RDB + AOF

Using both provides:

- RDB snapshots for compact backups and recovery options.
- AOF for a smaller recent-loss window.

When AOF is enabled, Redis normally uses it for restart recovery because it is expected to be more complete.

Test:

- Restart time.
- Rewrite behavior.
- Disk consumption.
- Corrupt-file recovery.
- Backup restore.
- Failover.
- Full resynchronization.

## 50. Fork and Copy-on-Write

RDB snapshots and AOF rewrites may fork a child process.

Initially, parent and child share memory pages. If the parent modifies a page, the operating system copies that page.

During high write traffic:

```text
copy-on-write memory
can become significant
```

Capacity must include headroom beyond `used_memory`.

Monitor:

- Fork duration.
- Copy-on-write bytes.
- RSS.
- Memory fragmentation.
- Write rate during persistence.
- Disk throughput.


<!-- IMAGE PLACEHOLDER
Title: Fork and copy-on-write memory pressure
What to use: A memory-page diagram showing parent and child initially sharing pages after fork, then hot writes copying modified pages. Include used_memory, RSS, and temporary COW headroom.
Preferred source: Redis official persistence and latency documentation.
Search terms: site:redis.io/docs Redis fork copy on write COW memory RDB AOF diagram
Purpose: Explain why a dataset that fits maxmemory can still exhaust host RAM during persistence.
Alt text: Redis parent and snapshot child share pages until writes trigger copy-on-write memory allocation.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 51. Persistence Does Not Equal Replication

Persistence protects against:

- Process restart.
- Machine restart.
- Some disk-backed recovery scenarios.

Replication protects against:

- One server becoming unavailable.
- Failover to another copy.

Neither automatically protects against:

- Application deleting data.
- A bad write replicating everywhere.
- Accidental flush.
- Corruption copied to replicas.
- Region-wide loss without offsite backup.

Use backups separately.

## 52. Durability Matrix

| Configuration | Crash recovery | Failover | Possible loss |
|---|---|---|---|
| No persistence, no replica | No | No | Entire dataset |
| RDB only | Snapshot | No | Since last snapshot |
| AOF every second | AOF replay | No | Recent writes |
| Replica, no persistence | Replica may survive | Yes with HA layer | Writes not replicated; entire dataset if all nodes restart |
| AOF + replica + Sentinel | Recovery and failover | Yes | Asynchronous replication/failover window |
| Redis Cluster with replicas + persistence | Per-shard recovery/failover | Yes | Asynchronous replication/failover window |

Do not promise zero data loss from ordinary asynchronous Redis replication.

---

# Replication

## 53. Primary-Replica Replication

A Redis primary accepts writes and streams resulting changes to replicas.

Replication is asynchronous by default.

Flow:

```text
client -> primary -> acknowledgement
                 \
                  -> replication stream -> replica
```

The primary usually acknowledges without waiting for the replica.

Advantages:

- Low write latency.
- Replica can take over after failure.
- Replicas can serve selected read workloads.

Trade-off:

- Replica lag.
- Acknowledged writes can be lost during failover.
- Replica reads may be stale.


<!-- IMAGE PLACEHOLDER
Title: Redis asynchronous replication
What to use: A sequence diagram showing client write to primary, immediate acknowledgement, asynchronous propagation to replicas, and a possible lag window before replicas apply the write.
Preferred source: Redis official documentation, “Redis replication”.
Search terms: site:redis.io/docs Redis primary replica asynchronous replication diagram
Purpose: Make replica staleness and acknowledged-write loss possible to see.
Alt text: Redis primary acknowledges a write before asynchronous replicas necessarily apply it.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 54. Partial Resynchronization

If a replica disconnects briefly, it can request only the missing portion of the replication stream.

This depends on:

- Replication IDs.
- Replication offsets.
- Backlog retaining the missed data.

If the required history is no longer in the backlog, a full resynchronization is required.


<!-- IMAGE PLACEHOLDER
Title: Partial resynchronization with replication backlog
What to use: A timeline showing replica disconnect, primary continuing writes into replication backlog, replica reconnecting with offset, and only missing commands being replayed.
Preferred source: Redis official documentation, “Redis replication”.
Search terms: site:redis.io/docs Redis partial resynchronization backlog offset diagram
Purpose: Explain how short disconnections avoid a full dataset transfer.
Alt text: A reconnecting Redis replica catches up from the primary replication backlog using its previous offset.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 55. Full Resynchronization

A full resynchronization conceptually involves:

1. Primary creates a dataset snapshot.
2. Snapshot is transferred to the replica.
3. Writes occurring during transfer are buffered.
4. Replica loads the snapshot.
5. Buffered and subsequent writes are applied.

This can consume:

- CPU.
- Network.
- Disk.
- Memory.
- Fork copy-on-write headroom.

A reconnect storm involving many replicas can heavily load a primary.


<!-- IMAGE PLACEHOLDER
Title: Full Redis replica synchronization
What to use: A staged diagram: primary creates snapshot, transfers it, buffers new writes, replica loads snapshot, then applies buffered changes and continues streaming.
Preferred source: Redis official documentation, “Redis replication”.
Search terms: site:redis.io/docs Redis full resynchronization snapshot replica diagram
Purpose: Show the CPU, memory, disk, and network cost of full sync.
Alt text: A Redis replica receives a full snapshot and then applies buffered writes before normal replication resumes.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 56. Replica Reads

Reading from replicas can scale read throughput for workloads that tolerate staleness.

Good candidates:

- Recommendations.
- Product descriptions.
- Analytics dashboards.
- Read-heavy cache data.
- Non-critical profiles.

Poor candidates:

- Read-after-write session updates.
- Inventory reservation.
- Rate-limit decisions.
- Lock ownership.
- Financial state.

Use separate client pools or explicit routing so correctness-sensitive reads always use the primary.

## 57. `WAIT`

`WAIT` asks the primary to wait until a specified number of replicas acknowledge receiving prior writes, subject to a timeout.

Conceptually:

```text
SET key value
WAIT 1 100
```

This improves the probability that a write exists on a replica before returning.

It does not turn Redis into a fully strongly consistent CP system:

- Replication and failover semantics still allow loss in some cases.
- Acknowledged data may not be durably fsynced.
- Network partitions and failover elections still matter.
- Cross-shard transactions are not created.

Use it to reduce the replication-loss window, not to claim zero-loss consensus.


<!-- IMAGE PLACEHOLDER
Title: Replication acknowledgement with WAIT
What to use: A sequence diagram showing SET acknowledged by primary, WAIT requesting one or more replica acknowledgements, and a note that receipt is not the same as consensus or durable fsync.
Preferred source: Redis official WAIT command and replication documentation.
Search terms: site:redis.io/docs Redis WAIT command replica acknowledgement diagram
Purpose: Clarify what WAIT improves and what it does not guarantee.
Alt text: WAIT delays the client until replicas acknowledge received writes but does not create consensus-based durability.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 58. Replica Lag

Lag can result from:

- Network delay.
- Replica CPU saturation.
- Slow disk or persistence.
- Large commands.
- Big keys.
- Output-buffer pressure.
- Full synchronization.
- Long-running scripts.
- Primary write burst.

Monitor replication offsets and lag rather than assuming replicas are current.

---

# Redis Sentinel

## 59. What Sentinel Provides

Sentinel adds high availability for a non-sharded Redis primary-replica deployment.

Sentinel provides:

- Monitoring.
- Failure detection.
- Notifications.
- Automatic failover.
- Discovery of the current primary for clients.

Sentinel does not shard the dataset.

Use Sentinel when:

```text
one primary's memory and throughput are sufficient
but automatic failover is required
```


<!-- IMAGE PLACEHOLDER
Title: Redis Sentinel architecture
What to use: A topology with one primary, two replicas, three Sentinel processes across failure domains, and clients discovering the current primary through Sentinel.
Preferred source: Redis official documentation, “High availability with Redis Sentinel”.
Search terms: site:redis.io/docs Redis Sentinel primary replicas three sentinels architecture diagram
Purpose: Introduce high availability for a non-sharded Redis deployment.
Alt text: Three Sentinel processes monitor one Redis primary and its replicas while clients discover the writable primary.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 60. Sentinel Topology

A typical deployment contains:

```text
1 Redis primary
2 or more Redis replicas
3 or more Sentinel processes
```

Place Sentinel processes across independent failure domains.

Avoid only two Sentinels. Majority-based authorization can become unavailable under a partition.

## 61. Subjective and Objective Down

Sentinel first decides locally that a primary appears down.

Conceptually:

- **Subjectively down:** One Sentinel believes the primary is unavailable.
- **Objectively down:** Enough Sentinels agree according to configured quorum.

A failover also requires authorization from a majority of Sentinel processes.

Quorum and majority are related but not identical:

- Quorum controls failure agreement.
- Majority authorizes a failover leader.


<!-- IMAGE PLACEHOLDER
Title: Sentinel subjective-down and objective-down decisions
What to use: A decision flow showing one Sentinel marking SDOWN, multiple Sentinels exchanging opinions, configured quorum producing ODOWN, and majority authorization before failover.
Preferred source: Redis official documentation, “High availability with Redis Sentinel”.
Search terms: site:redis.io/docs Redis Sentinel SDOWN ODOWN quorum majority diagram
Purpose: Differentiate failure detection quorum from failover authorization majority.
Alt text: Sentinel progresses from one observer’s subjective failure to quorum agreement and majority-authorized failover.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 62. Sentinel Failover

High-level flow:

1. Sentinels detect primary failure.
2. Enough Sentinels agree.
3. A Sentinel is elected to coordinate failover.
4. A suitable replica is selected.
5. Replica is promoted.
6. Other replicas follow the new primary.
7. Clients discover the new primary.
8. Old primary is reconfigured as a replica when it returns.

Because replication is asynchronous, the promoted replica may not contain the latest acknowledged writes.


<!-- IMAGE PLACEHOLDER
Title: Redis Sentinel failover sequence
What to use: A numbered failover diagram showing failure detection, leader Sentinel election, replica selection, promotion, replica reconfiguration, client rediscovery, and old primary returning as replica.
Preferred source: Redis official documentation, “High availability with Redis Sentinel”.
Search terms: site:redis.io/docs Redis Sentinel failover sequence promotion replica client
Purpose: Explain the complete failover path and temporary application error window.
Alt text: Sentinel promotes a replica, redirects clients, and reconfigures the old primary after recovery.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 63. Client Integration with Sentinel

Clients should query Sentinel for the current primary rather than hard-coding one server address.

The client must handle:

- Primary change.
- Connection reset.
- In-flight command ambiguity.
- Retry.
- Replica reconfiguration.
- Temporary unavailability.

A failover may cause a short error window. Application retries must be safe.

## 64. Sentinel Limitations

Sentinel does not provide:

- Horizontal sharding.
- Zero acknowledged-write loss.
- Strong consistency.
- Cross-region multi-primary.
- Multi-key transactions beyond one primary.
- Protection from logical corruption.

If one server cannot hold the dataset or handle the traffic, use Redis Cluster or a managed sharded service.

---

# Redis Cluster

## 65. Why Redis Cluster Exists

Standalone Redis and Sentinel keep the entire dataset on one primary.

Redis Cluster distributes keys across multiple primary shards.

It provides:

- Horizontal memory scaling.
- Horizontal command throughput.
- Per-shard primary-replica failover.
- Online resharding.


<!-- IMAGE PLACEHOLDER
Title: Redis Cluster overview
What to use: A six-node topology with three primary shards and one replica per primary. Show clients routing directly to the primary responsible for each hash slot.
Preferred source: Redis official documentation, “Scale with Redis Cluster”.
Search terms: site:redis.io/docs Redis Cluster three primaries three replicas architecture diagram
Purpose: Introduce Redis horizontal sharding and per-shard high availability.
Alt text: Redis Cluster distributes hash slots across three primaries, each protected by a replica.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 66. Hash Slots

Redis Cluster has:

```text
16,384 hash slots
```

The slot is computed conceptually as:

```text
CRC16(key) mod 16384
```

Each primary owns a subset of slots.

Example:

```text
Primary A -> slots 0–5460
Primary B -> slots 5461–10922
Primary C -> slots 10923–16383
```

The exact slot distribution can change during resharding.


<!-- IMAGE PLACEHOLDER
Title: 16,384 Redis Cluster hash slots
What to use: A slot-space bar from 0 to 16383 divided among three primary nodes, with sample keys hashed into slots. Include the CRC16(key) mod 16384 formula.
Preferred source: Redis official documentation, “Scale with Redis Cluster” and “Redis Cluster specification”.
Search terms: site:redis.io/docs Redis Cluster 16384 hash slots CRC16 diagram
Purpose: Show the routing unit and make clear that keys—not individual fields or members—map to slots.
Alt text: Redis Cluster divides 16,384 hash slots among primary nodes and routes each key by its slot.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 67. Client Routing

Cluster-aware clients maintain a mapping:

```text
hash slot -> primary node
```

If a client sends a command to the wrong node, Redis may return:

- `MOVED`: The slot belongs elsewhere.
- `ASK`: During migration, send this request to a temporary target.

A good client:

- Caches the slot map.
- Refreshes it when redirected.
- Connects directly to shards.
- Avoids routing every command through random nodes.

Redis Cluster nodes do not act as transparent request proxies for normal key commands.


<!-- IMAGE PLACEHOLDER
Title: Cluster-aware client routing and redirections
What to use: A request sequence where a client computes a slot, sends directly to a shard, receives MOVED for stale routing, refreshes the slot map, and uses ASK during slot migration.
Preferred source: Redis official Cluster documentation and cluster specification.
Search terms: site:redis.io/docs Redis Cluster MOVED ASK client routing diagram
Purpose: Explain why clients must be cluster-aware and how online slot migration works.
Alt text: A Redis Cluster client maintains slot routing and handles MOVED and ASK redirections.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 68. Cross-Slot Operations

Multi-key commands require all keys to be in the same slot.

This applies to many:

- `MGET`.
- `MSET`.
- Set operations.
- Transactions.
- Lua scripts.
- Functions.

Use hash tags:

```text
cart:{user-123}
cart-items:{user-123}
cart-total:{user-123}
```

Do not force unrelated global data into one slot merely to preserve multi-key operations.


<!-- IMAGE PLACEHOLDER
Title: Cross-slot error versus same-slot hash tags
What to use: A side-by-side diagram. Left: MGET for keys on separate shards fails with CROSSSLOT. Right: keys sharing {user-123} map to one slot and the multi-key operation succeeds.
Preferred source: Redis official Cluster documentation and cluster specification.
Search terms: site:redis.io/docs Redis CROSSSLOT MGET hash tags diagram
Purpose: Make the Redis Cluster multi-key restriction concrete.
Alt text: A multi-key command fails across slots but succeeds when related keys share a Redis Cluster hash tag.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 69. Cluster Shard Topology

A common minimum production-style topology is:

```text
3 primary shards
1 replica per primary
= 6 Redis nodes
```

This allows one replica to be promoted when a primary fails, assuming the cluster can reach the required majority and each failed primary has an eligible replica.

More replicas increase fault tolerance but consume more memory.

## 70. Cluster Failover

High-level flow:

1. Cluster nodes exchange failure information.
2. A primary is marked failed.
3. Its replica requests authorization.
4. A majority of primaries authorizes promotion.
5. The replica becomes primary for the slots.
6. Clients refresh slot routing.

A shard has limited availability if both its primary and every eligible replica are unavailable.

Larger failures can make the whole cluster unavailable, particularly when a majority of primaries is not reachable.


<!-- IMAGE PLACEHOLDER
Title: Redis Cluster shard failover
What to use: A before-and-after topology showing one primary failing, its replica requesting authorization from a majority of primaries, promotion, slot ownership transfer, and client slot-map refresh.
Preferred source: Redis official documentation, “Scale with Redis Cluster” and cluster specification.
Search terms: site:redis.io/docs Redis Cluster failover replica promotion majority diagram
Purpose: Explain per-shard failover and why an eligible replica plus cluster majority are required.
Alt text: A Redis Cluster replica is promoted to own its failed primary’s slots after majority authorization.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 71. Redis Cluster Consistency

Redis Cluster uses asynchronous replication.

Possible acknowledged-write loss:

1. Primary accepts a write.
2. Primary acknowledges the client.
3. Primary fails before replica receives the write.
4. Replica is promoted.
5. The acknowledged write is absent.

Redis Cluster prioritizes performance and availability with best-effort write safety. It is not a consensus-based strongly consistent database.


<!-- IMAGE PLACEHOLDER
Title: Acknowledged-write loss during Redis failover
What to use: A timeline showing primary accepts and acknowledges a write, fails before replication, stale replica is promoted, and the acknowledged value disappears.
Preferred source: Redis official Cluster specification and replication documentation.
Search terms: site:redis.io/docs Redis Cluster acknowledged write loss asynchronous failover diagram
Purpose: Visually establish that Redis Cluster is not strongly consistent across failover.
Alt text: A write acknowledged by a Redis primary is lost when the primary fails before its replica receives it.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 72. Minority Partition

A primary isolated on the minority side may temporarily accept writes before it realizes the cluster state and stops serving.

Those writes can be lost when the majority side elects a different primary.

Clients should connect through healthy cluster-aware routing and avoid operating against an isolated minority.

## 73. Resharding

Adding a primary does not automatically move all data instantly.

High-level process:

1. Add node.
2. Assign or move hash slots.
3. Migrate keys.
4. Update cluster metadata.
5. Clients follow redirections during movement.

Resharding can occur online, but it consumes:

- Network.
- CPU.
- Memory.
- Client redirections.
- Operational attention.

Plan capacity additions before emergency saturation.


<!-- IMAGE PLACEHOLDER
Title: Online Redis Cluster resharding
What to use: A diagram showing a fourth primary being added, selected slots moving from existing primaries, keys migrating, ASK redirections during movement, and the final balanced slot map.
Preferred source: Redis official documentation, “Scale with Redis Cluster”.
Search terms: site:redis.io/docs Redis Cluster resharding slot migration ASK diagram
Purpose: Explain that adding a node requires slot movement and consumes resources.
Alt text: Redis Cluster moves hash slots and their keys to a new primary while clients follow temporary redirections.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 74. Cluster Hot Slot

Even distribution of hash slots does not guarantee even workload.

A single key maps to one slot and one primary.

Examples:

```text
global leaderboard
one viral post counter
one giant set
one global rate-limit key
```

Adding shards does not split one key.

Mitigations:

- Shard the logical key.
- Use local partial aggregates.
- Batch updates.
- Separate extreme hot keys.
- Use application-level partitioning.
- Periodically merge results.


<!-- IMAGE PLACEHOLDER
Title: Hot key despite many Redis shards
What to use: A traffic heatmap showing one global leaderboard or viral counter receiving most requests on one shard while other shards remain idle. Add application-level sharding as the mitigation.
Preferred source: Create an original diagram based on Redis Cluster key-to-slot behavior.
Search terms: Redis Cluster hot key hot slot application sharding diagram
Purpose: Show why horizontal cluster scale does not automatically split one hot key.
Alt text: One hot Redis key overloads a single cluster shard even when other shards have spare capacity.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 75. Cluster and Logical Databases

Redis Cluster supports only database `0`.

Do not use:

```text
SELECT 1
```

for tenant isolation.

Use:

- Key prefixes.
- Separate clusters.
- Separate managed databases.
- ACLs.
- Application-level tenancy.

---

# Consistency, Availability and CAP

## 76. Standalone Redis

A single Redis node provides a simple serialized command order while it is available.

Trade-off:

```text
node failure -> unavailable
```

Persistence affects recovery, not live availability.

## 77. Sentinel Deployment

Normal operation:

- Writes go to one primary.
- Replication to replicas is asynchronous.
- Primary commands are serialized.

During failover:

- Temporary unavailability.
- A replica is promoted.
- Recent acknowledged writes may be lost.
- A stale old primary must not continue receiving writes.

This is not strict linearizability across failover.

## 78. Redis Cluster

Redis Cluster partitions keys across primaries.

For a key under normal healthy routing:

- Commands on its primary are serialized.
- Replicas are asynchronous.
- Cross-slot operations are limited.

During partitions:

- Majority-side availability is favored.
- Minority-side acknowledged writes may be lost.
- Larger failures can stop the cluster.

## 79. Read-After-Write

Primary read:

```text
write to primary -> read from same primary
```

normally observes the write after the write command succeeds.

Replica read:

```text
write to primary -> immediate read from replica
```

may return stale data.

Failover can violate observed write durability if the promoted replica had not received the write.

## 80. Correct Interview Statement

> Redis provides atomic command execution on a primary, but Redis Open Source replication is asynchronous. Sentinel and Redis Cluster improve availability through replica promotion, while allowing a window in which acknowledged writes can be lost. Stronger acknowledgement with `WAIT` reduces but does not eliminate the distributed failover risk.

---


<!-- IMAGE PLACEHOLDER
Title: Redis consistency and availability spectrum
What to use: A comparison visual for standalone Redis, primary plus replicas, Sentinel, and Cluster. For each, show availability, sharding, replica staleness, failover, and possible acknowledged-write loss.
Preferred source: Redis official replication, Sentinel, Cluster, and WAIT documentation.
Search terms: site:redis.io/docs Redis consistency availability Sentinel Cluster replication WAIT
Purpose: Summarize Redis distributed-system semantics in one interview-ready graphic.
Alt text: Redis deployment modes trade sharding and availability against asynchronous replication and failover data-loss windows.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
# Transactions and Programmability

## 81. `MULTI` and `EXEC`

A transaction queues commands and executes them sequentially when `EXEC` is called.

```text
MULTI
INCR account:1:counter
INCR account:2:counter
EXEC
```

Guarantee:

- No other client's command is interleaved between the transaction's queued operations during execution.

Limitations:

- Commands are queued without seeing earlier queued results.
- Runtime command errors do not roll back successful commands.
- Redis transactions are not relational ACID transactions across durable rows.
- In Cluster, all involved keys must be in the same slot.


<!-- IMAGE PLACEHOLDER
Title: Redis transactions with MULTI, EXEC and WATCH
What to use: A timeline showing commands queued after MULTI, executed together at EXEC without interleaving, plus a WATCH conflict causing EXEC to abort. Include “no automatic rollback”.
Preferred source: Redis official documentation, “Transactions”.
Search terms: site:redis.io/docs Redis MULTI EXEC WATCH transaction diagram no rollback
Purpose: Explain Redis transaction isolation and its difference from relational transactions.
Alt text: Redis queues commands inside MULTI and executes them without interleaving, while WATCH aborts on concurrent modification.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 82. No Automatic Rollback

Redis may execute valid commands even if one command in a transaction fails at runtime.

The application must validate types and arguments before execution.

Do not describe `MULTI/EXEC` as a general rollback transaction.

## 83. `WATCH`

`WATCH` provides optimistic concurrency control.

Flow:

```text
WATCH balance:user:123
GET balance:user:123
MULTI
SET balance:user:123 <new-value>
EXEC
```

If a watched key changes before `EXEC`, the transaction aborts.

The client must:

- Re-read.
- Recompute.
- Retry with a limit.
- Avoid retry storms under contention.

For simple counters, use atomic commands instead of `WATCH`.

## 84. Lua Scripts

Lua scripts execute atomically on the Redis server.

Example use:

```text
if current counter is below limit:
    increment
    set expiry if new
    return allowed
else:
    return rejected
```

Advantages:

- One network round trip.
- Atomic multi-command logic.
- Logic runs close to data.

Risks:

- Long scripts block other commands on the shard.
- Script cache can be cleared.
- Debugging and versioning are harder.
- Cluster keys must be in the same slot.
- Unbounded loops are dangerous.


<!-- IMAGE PLACEHOLDER
Title: Atomic server-side Lua execution
What to use: A diagram comparing four client/server round trips with one EVAL call that reads, checks, updates, and expires keys atomically on one shard. Add a warning that long scripts block the shard.
Preferred source: Redis official documentation, “Scripting with Lua”.
Search terms: site:redis.io/docs Redis Lua script atomic server side diagram
Purpose: Show both the latency and atomicity benefits of server-side logic.
Alt text: A Redis Lua script combines multiple reads and writes into one atomic server-side execution.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 85. Redis Functions

Redis Functions allow server-side Lua logic to be loaded and managed as part of the database's programmable state.

Use Functions for stable reusable atomic logic, while keeping functions short, deterministic and bounded.

## 86. Command vs Transaction vs Script

| Need | Prefer |
|---|---|
| One atomic operation exists | Built-in command |
| Queue commands without conditional computation | `MULTI/EXEC` |
| Optimistic compare-and-set | `WATCH` + transaction |
| Read, compute and write atomically | Lua script or Function |
| Cross-shard atomicity | Redesign; Redis Cluster does not provide general cross-shard transaction |

---

# Pipelining and Batching

## 87. Network Round Trips

Without pipelining:

```text
send command
wait for response
send command
wait for response
```

For 1 ms RTT and 1,000 commands, round-trip waiting alone can approach one second.

## 88. Pipelining

Pipelining sends multiple commands before waiting for responses.

Advantages:

- Fewer network stalls.
- Higher throughput.
- Better CPU efficiency.

Trade-offs:

- Responses consume client and server buffers.
- Huge pipelines increase latency and memory.
- Errors must be mapped to individual commands.
- Pipelining is not atomic.

Use bounded batches rather than millions of commands in one pipeline.


<!-- IMAGE PLACEHOLDER
Title: Redis pipelining reduces round trips
What to use: A latency timeline comparing sequential command-response pairs with a pipeline that sends many commands together and receives a batch of replies.
Preferred source: Redis official documentation for pipelining.
Search terms: site:redis.io/docs Redis pipelining network round trips diagram
Purpose: Make clear that pipelining is a throughput optimization, not a transaction.
Alt text: Redis pipelining batches network requests and responses to reduce round-trip waiting.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 89. Pipelining vs Transaction

Pipelining:

```text
performance optimization
```

Transaction:

```text
execution isolation for queued commands
```

## 90. Cluster Pipelining

A pipeline containing keys from many hash slots must be partitioned by target node.

A cluster-aware client should:

1. Compute slots.
2. Group commands by primary.
3. Pipeline to each primary.
4. Combine responses.

One pipeline cannot be treated as one atomic cluster-wide batch.

---

# Pub/Sub

## 91. Pub/Sub Model

Publishers send messages to channels.

```text
PUBLISH notifications:user:123 "new-message"
```

Use for:

- Live UI updates.
- Cache invalidation signals.
- Presence notifications.
- Non-critical real-time events.
- Fan-out to currently connected subscribers.


<!-- IMAGE PLACEHOLDER
Title: Redis Pub/Sub fan-out
What to use: A publisher sending one message to a channel with multiple currently connected subscribers receiving it. Show an offline subscriber missing the message permanently.
Preferred source: Redis official documentation, “Redis Pub/Sub”.
Search terms: site:redis.io/docs Redis PubSub publisher subscribers at most once diagram
Purpose: Explain live fan-out and at-most-once non-retained delivery.
Alt text: A Redis Pub/Sub message reaches connected subscribers but is not retained for an offline subscriber.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 92. Delivery Semantics

Redis Pub/Sub provides at-most-once delivery.

If a subscriber is disconnected or unable to process the message, the message is not replayed.

Use Streams or Kafka when messages must be retained and acknowledged.

## 93. Pub/Sub vs Streams

| Requirement | Pub/Sub | Streams |
|---|---|---|
| Retention | No | Yes |
| Offline consumer catch-up | No | Yes |
| Consumer acknowledgement | No | Yes |
| Pending message tracking | No | Yes |
| Live broadcast | Excellent | Supported |
| Work queue | Poor fit | Good for moderate workloads |
| Long-term durable log | No | Kafka often better |

---


<!-- IMAGE PLACEHOLDER
Title: Pub/Sub versus Streams
What to use: A side-by-side architecture: Pub/Sub with transient channels and online subscribers; Streams with retained entries, consumer groups, pending entries, and acknowledgements.
Preferred source: Redis official documentation, “Redis Pub/Sub” and “Redis Streams”.
Search terms: site:redis.io/docs Redis PubSub vs Streams diagram retention acknowledgment
Purpose: Help readers select the correct messaging primitive.
Alt text: Redis Pub/Sub provides transient fan-out while Streams retain messages and track consumer acknowledgements.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
# Redis Streams

## 94. Stream Entry IDs

An entry ID normally contains:

```text
milliseconds-sequence
```

Using `*` lets Redis generate the ID.

```text
XADD order-events * order_id 123 status CREATED
```

## 95. Consumer Groups

A consumer group allows multiple consumers to divide work.

```text
XGROUP CREATE orders workers 0 MKSTREAM
XREADGROUP GROUP workers worker-1 COUNT 10 BLOCK 5000 STREAMS orders >
XACK orders workers <message-id>
```

Redis records delivered-but-unacknowledged messages in a pending entries list.


<!-- IMAGE PLACEHOLDER
Title: Redis Stream consumer-group lifecycle
What to use: A stream feeding one consumer group with three consumers. Show new-message assignment, pending entries, XACK, worker failure, XAUTOCLAIM, retry, and dead-letter stream.
Preferred source: Redis official documentation, “Redis Streams”.
Search terms: site:redis.io/docs Redis Streams consumer group pending XACK XAUTOCLAIM diagram
Purpose: Explain at-least-once processing and recovery from failed consumers.
Alt text: Redis Stream consumer groups distribute entries, track unacknowledged work, and reclaim abandoned messages.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 96. At-Least-Once Processing

If a consumer processes a message but crashes before `XACK`, another consumer may process it again.

Therefore handlers must be idempotent.

## 97. Claiming Abandoned Messages

Use pending-entry inspection and claiming to recover work from failed consumers.

Add:

- Retry count.
- Dead-letter stream.
- Processing timeout.
- Idempotency.
- Monitoring.

## 98. Stream Retention

Streams grow until trimmed.

Use:

```text
XTRIM
MAXLEN
MINID
```

Define:

- Maximum entries.
- Maximum age.
- Reprocessing window.
- Pending-message behavior.

An unbounded stream can exhaust memory.

## 99. Streams vs Kafka

Choose Redis Streams when:

- The log is short-lived.
- Data fits Redis memory budget.
- Latency must be very low.
- Consumer count and retention are moderate.
- Redis is already operated.

Choose Kafka when:

- Retention is days or months.
- Event volume is very high.
- Replay is central.
- Many consumer groups exist.
- Disk-backed scale is required.


---


<!-- IMAGE PLACEHOLDER
Title: Redis Streams versus Kafka architecture
What to use: A decision comparison showing Redis Streams as an in-memory short-retention queue and Kafka as a partitioned disk-backed durable log with long retention and many consumer groups.
Preferred source: Redis official Streams documentation and Apache Kafka official architecture documentation.
Search terms: Redis Streams vs Kafka architecture retention replay diagram
Purpose: Distinguish use cases instead of positioning either system as universally better.
Alt text: Redis Streams favors low-latency short-lived queues, while Kafka favors durable partitioned event logs and replay.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
# Distributed Locks

## 100. Basic Lock Acquisition

A common single-instance lock uses:

```text
SET lock:resource-1 <unique-token> NX PX 10000
```

Properties:

- `NX`: Set only if absent.
- `PX`: Lease expiry.
- Unique token identifies the owner.

Never use:

```text
SETNX lock
EXPIRE lock
```

as two separate commands. A crash between them can leave a lock without expiration.


<!-- IMAGE PLACEHOLDER
Title: Redis lease lock acquisition and release
What to use: A sequence diagram showing SET lock token NX PX, critical section, atomic compare-token-and-delete release, and automatic lease expiry after client crash.
Preferred source: Redis official documentation, “Distributed Locks with Redis”.
Search terms: site:redis.io/docs Redis distributed lock SET NX PX release Lua diagram
Purpose: Show the minimum correct single-instance Redis lock pattern.
Alt text: A client acquires a Redis lease with a unique token and releases it only when the token still matches.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 101. Safe Lock Release

Do not release with unconditional:

```text
DEL lock:resource-1
```

The lease may have expired and another client may own the lock.

Use an atomic script:

```lua
if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
else
    return 0
end
```

The token must match the current owner.

## 102. Lease Expiry

A lock lease prevents permanent deadlock, but creates another risk:

1. Client acquires a 10-second lock.
2. Client pauses for 15 seconds.
3. Lock expires.
4. Another client acquires it.
5. First client resumes and still modifies the resource.

A Redis lock alone does not prevent a paused old owner from acting.


<!-- IMAGE PLACEHOLDER
Title: Lock lease expiry creates two concurrent owners
What to use: A timeline where Client A acquires a lock and pauses, the lease expires, Client B acquires it, and Client A resumes. Highlight overlapping critical-section execution.
Preferred source: Create an original diagram based on the distributed-lock safety issue discussed in this section.
Search terms: Redis lock lease expiry paused client two owners diagram
Purpose: Explain why token-checked deletion alone does not protect the underlying resource.
Alt text: A paused lock owner resumes after lease expiry while a new owner is already acting.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 103. Fencing Tokens

A fencing token is a monotonically increasing number issued with each lock acquisition.

```text
Client A token = 41
Client B token = 42
```

The protected resource rejects operations with a token lower than the latest accepted token.

Use for:

- Storage writes.
- Job ownership.
- Lease-based coordination.


<!-- IMAGE PLACEHOLDER
Title: Fencing tokens protect the resource
What to use: A diagram with lock service issuing monotonically increasing tokens 41 and 42, then the protected storage rejecting Client A’s late write with token 41 after accepting token 42.
Preferred source: Create an original fencing-token diagram; use Redis distributed-lock documentation for lock context.
Search terms: distributed lock fencing token stale owner resource rejection diagram
Purpose: Show how final correctness is enforced by the protected resource.
Alt text: The protected resource rejects stale writes carrying an older fencing token.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 104. Lock Correctness Decision

Use a Redis lock when:

- Duplicate execution is tolerable or idempotent.
- The lock is an optimization.
- The lease is short.
- Failure consequences are bounded.
- Fencing is available where necessary.

Use a consensus-backed system or database transaction when:

- Two owners can cause financial loss.
- Global uniqueness must be guaranteed.
- The protected resource cannot enforce fencing.
- Network partitions and process pauses must not violate safety.

## 105. Redlock

Redlock acquires leases from multiple independent Redis primaries to improve tolerance of individual failures.

It has important assumptions involving:

- Time bounds.
- Independent nodes.
- Lease duration.
- Network delay.
- Process pauses.

For HLD interviews, do not merely say:

```text
Use Redlock, therefore the lock is perfectly safe.
```

State the safety requirement and whether fencing or consensus is required.

---

# Rate Limiting

## 106. Why Redis Is Used

Rate limiting needs:

- Low latency on every request.
- Atomic counter updates.
- Expiry.
- High throughput.
- Small hot state.

Redis is a natural fit.

## 107. Fixed Window Counter

Key:

```text
rate:<identity>:<window-start>
```

Flow:

```text
INCR key
if first increment:
    EXPIRE key window-size
allow if count <= limit
```

Use a script or transaction so increment and expiry are set atomically.

Advantages:

- Simple.
- O(1).
- Low memory.

Problem:

```text
limit 100/minute
100 requests at 12:00:59
100 requests at 12:01:00
```

A user can send 200 requests across the boundary.


<!-- IMAGE PLACEHOLDER
Title: Redis rate-limiting algorithms comparison
What to use: A four-panel infographic comparing fixed window, sliding log, sliding counter, and token bucket. Show state stored in Redis, accuracy, memory, burst behavior, and typical command complexity.
Preferred source: Redis official rate-limiter use cases and command documentation.
Search terms: site:redis.io/docs Redis rate limiter fixed window sliding window token bucket diagram
Purpose: Give an interview-ready overview of all major algorithms before their detailed sections.
Alt text: Four Redis rate-limiting algorithms trade precision, memory, and burst handling differently.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 108. Sliding Window Log

Use a sorted set:

```text
key = rate:user:123
score = request timestamp
member = unique request ID
```

Atomic steps:

1. Remove entries older than the window.
2. Count current entries.
3. Add request if below limit.
4. Set expiry.

Advantages:

- Accurate sliding window.

Trade-offs:

- One member per request.
- More memory.
- `O(log N)` updates plus deletion work.
- Hot sorted set for high-volume identities.

## 109. Sliding Window Counter

Maintain counts for the current and previous fixed windows and weight the previous count based on elapsed time.

Advantages:

- Less memory than a log.
- Smoother than fixed window.

Trade-off:

- Approximate.

## 110. Token Bucket

State:

```text
current tokens
last refill timestamp
```

For each request:

1. Refill based on elapsed time.
2. Cap at bucket capacity.
3. Consume tokens if available.
4. Save state.

Use a Lua script or Function for atomic computation.

Advantages:

- Supports bursts.
- Enforces average rate.


<!-- IMAGE PLACEHOLDER
Title: Token bucket refill and consume flow
What to use: A bucket diagram showing capacity, tokens added over time, request consuming tokens, burst allowance, rejection when empty, and atomic Lua execution of refill plus consume.
Preferred source: Redis official token-bucket rate limiter tutorial and scripting documentation.
Search terms: site:redis.io/docs Redis token bucket rate limiter Lua diagram
Purpose: Explain why token bucket supports bursts while enforcing an average rate.
Alt text: A Redis token bucket refills over time and atomically consumes tokens for accepted requests.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 111. Leaky Bucket

Requests enter a bounded queue and leave at a fixed rate.

Use when smoothing outgoing processing is more important than immediately rejecting bursts.

## 112. Cluster Design for Rate Limiting

All state for one identity should map to one slot.

```text
rate:{user-123}:tokens
rate:{user-123}:metadata
```

Avoid one global key.

For a global service-wide limit, consider:

- Per-shard local limits.
- Central coordinator.
- Hierarchical quota.
- Approximate distributed limit.
- Stronger centralized store if exactness is mandatory.

---


<!-- IMAGE PLACEHOLDER
Title: Rate-limit keys distributed across Redis Cluster
What to use: A cluster diagram showing each user’s rate-limit state co-located by hash tag on one shard, identities distributed across shards, and a separate challenge for one exact global limit.
Preferred source: Redis official Cluster and rate-limiter documentation.
Search terms: Redis Cluster rate limiter hash tag per user global limit diagram
Purpose: Explain scalable per-identity limits and the difficulty of exact global limits.
Alt text: Per-user rate-limit keys distribute across Redis Cluster while one exact global limit becomes a coordination hotspot.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
# Counters and Aggregation

## 113. Atomic Counters

```text
INCR
INCRBY
HINCRBY
ZINCRBY
```

Use for:

- Views.
- Likes.
- Attempts.
- Quotas.
- Sequence-like IDs.
- Real-time metrics.

Define whether the count must be:

- Exact.
- Durable.
- Monotonic.
- Globally unique.
- Recoverable.
- Bounded by time.

## 114. Hot Counter Sharding

One viral counter can saturate one shard.

Shard it:

```text
post:99:views:0
post:99:views:1
...
post:99:views:63
```

Each writer selects a shard.

Read:

```text
sum all 64 counters
```

Trade-off:

- Writes scale.
- Reads require aggregation.
- Value is eventually or periodically combined.


<!-- IMAGE PLACEHOLDER
Title: Sharded hot counter
What to use: A fan-in/fan-out diagram where writers increment one of N counter shards and readers or an aggregator sum all shards into a total.
Preferred source: Create an original diagram based on Redis atomic counter and Cluster behavior.
Search terms: Redis sharded counter hot key aggregation diagram
Purpose: Show how write throughput is distributed at the cost of more complex reads.
Alt text: Writers spread increments across many Redis counter shards and readers aggregate the partial totals.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 115. Durable Counter Pattern

For counts that must be recoverable:

```text
event -> Kafka
      -> durable storage
      -> stream aggregator
      -> Redis current count
```

Redis serves the current result, while the event log remains the source of truth.

---

# Leaderboards

## 116. Basic Leaderboard

```text
ZADD leaderboard:weekly 500 user:123
ZINCRBY leaderboard:weekly 20 user:123
ZREVRANK leaderboard:weekly user:123
ZREVRANGE leaderboard:weekly 0 99 WITHSCORES
```

Sorted sets provide rank operations naturally.


<!-- IMAGE PLACEHOLDER
Title: Leaderboard read and write APIs
What to use: A visual sorted set with score updates, top-100 query, player-rank query, and surrounding-rank query. Include the one-key/one-shard limitation for a global leaderboard.
Preferred source: Redis official sorted-set documentation.
Search terms: site:redis.io/docs Redis leaderboard sorted set top rank surrounding users diagram
Purpose: Connect sorted-set commands to common leaderboard product APIs.
Alt text: A Redis sorted set supports score updates, top ranks, and one player’s surrounding leaderboard entries.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 117. Tie Handling

Equal scores are ordered lexicographically by member.

If business rules require:

```text
higher score first
then earlier achievement first
```

encode a composite score carefully or store tie-break metadata separately.

Floating-point score precision limits must be considered.

## 118. Time-Bucketed Leaderboards

Use separate keys:

```text
leaderboard:daily:2026-07-11
leaderboard:weekly:2026-W28
leaderboard:all-time
```

Set TTL for temporary periods.

## 119. Global Leaderboard in Cluster

One sorted set resides on one shard.

Options:

- Keep one shard if throughput is sufficient.
- Partition by region or game mode.
- Maintain shard-local top-K.
- Merge candidates in an aggregation service.
- Store exact all-time data elsewhere.

Redis Cluster does not split one sorted set across nodes.

---

# Sessions, Tokens and Presence

## 120. Session Store

Example:

```text
SET session:<token> <serialized-session> EX 1800
```

or:

```text
HSET session:<token> user_id 123 role premium
EXPIRE session:<token> 1800
```

Requirements:

- Secure random token.
- TTL.
- Logout deletion.
- Rotation after privilege changes.
- Encryption or minimal sensitive data.
- HA if sessions must survive node failure.


<!-- IMAGE PLACEHOLDER
Title: Redis session-store architecture
What to use: A diagram with multiple stateless application servers sharing Redis sessions, session TTL refresh, logout deletion, primary reads for freshness, and durable user data remaining in a database.
Preferred source: Redis session-management use cases and replication documentation.
Search terms: Redis session store stateless servers TTL architecture diagram
Purpose: Show how Redis enables stateless application scaling without becoming the user database.
Alt text: Stateless application servers share expiring sessions in Redis while durable user records remain in a database.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 121. Session Consistency

If the user logs out:

```text
DEL session:key
```

A stale replica may still serve the session briefly.

Correctness-sensitive session reads should use the primary unless replica staleness is acceptable.

## 122. OTP and Reset Tokens

```text
SET otp:user:123 <hash> NX EX 300
```

Store a hash rather than plaintext when practical.

Atomic consume pattern:

1. Verify token.
2. Delete token.
3. Record attempt.

Use a script or transaction to avoid reuse races.

## 123. Presence

```text
SET presence:user:123 online EX 30
```

Clients refresh periodically.

Presence is naturally approximate:

- Network delay.
- Refresh interval.
- Expiration delay.
- Process crash.

State the staleness tolerance:

```text
User may appear online for up to 30 seconds after disconnect.
```

---

# Idempotency and Deduplication

## 124. Idempotency Key

```text
idempotency:<scope>:<request-id>
```

Basic acquisition:

```text
SET key PROCESSING NX EX 300
```

After success:

```text
SET key <serialized-response> XX EX 86400
```

A robust design distinguishes:

- Processing.
- Completed.
- Failed/retryable.
- Request hash.
- Response.
- Expiration.


<!-- IMAGE PLACEHOLDER
Title: Idempotency-key state machine
What to use: A state diagram with ABSENT -> PROCESSING -> COMPLETED, plus PROCESSING expiry and retry. Show duplicate request behavior and stored response reuse.
Preferred source: Redis official SET command and transaction/scripting documentation; create an original state diagram.
Search terms: Redis idempotency key processing completed duplicate request state machine
Purpose: Explain that a single NX key is not enough without processing and recovery states.
Alt text: A Redis idempotency record moves from absent to processing to completed and returns the stored result for duplicates.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 125. Concurrent Duplicate Requests

Two identical requests:

```text
request A -> SET NX succeeds
request B -> SET NX fails
```

Request B can:

- Wait.
- Poll.
- Return conflict.
- Return stored response if completed.

The state transition should be atomic. Lua or Functions can help.

## 126. Failure During Processing

If the process crashes after acquiring the key:

- TTL eventually releases `PROCESSING`.
- Retried work may execute again.
- Downstream side effects must be idempotent.

Redis idempotency does not make a non-idempotent external payment call exactly once.

## 127. Deduplication Window

For event deduplication:

```text
SET dedup:<event-id> 1 NX EX 86400
```

Trade-offs:

- Deduplication only lasts for TTL.
- Redis loss can re-enable duplicates.
- Memory scales with event rate × TTL.
- Set-before-processing can lose work.
- Set-after-processing can duplicate work.

Exactly-once processing requires coordination with the source and sink, not only Redis.

---

# Queues and Delayed Jobs

## 128. List Queue

Simple queue:

```text
LPUSH jobs <payload>
BRPOP jobs 0
```

Problem:

```text
worker pops
worker crashes
job is lost
```

A safer list pattern moves the item to a processing list before work, then removes it after success.

Redis Streams usually provides a cleaner acknowledgement model.

## 129. Delayed Queue with Sorted Set

```text
ZADD delayed-jobs <execution-time-ms> <job-id>
```

Worker:

1. Query earliest due jobs.
2. Atomically claim one.
3. Move to processing.
4. Execute.
5. Mark complete.

Do not use `ZRANGEBYSCORE` and `ZREM` as separate unprotected operations across workers.

Use a script or Function for atomic claim.


<!-- IMAGE PLACEHOLDER
Title: Delayed-job queue using a sorted set
What to use: A timeline-index diagram where execution timestamp is the sorted-set score, workers atomically claim due jobs, move them to processing, retry failures, and send poison jobs to a dead-letter queue.
Preferred source: Redis sorted-set, scripting, and Streams documentation; create an original design diagram.
Search terms: Redis delayed queue sorted set atomic claim retry dead letter diagram
Purpose: Show the complete scheduler workflow, not only ZADD and ZRANGEBYSCORE.
Alt text: Redis stores delayed jobs by execution timestamp and workers atomically claim, process, retry, or dead-letter them.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 130. Scheduler Limitations

A Redis delayed queue requires handling:

- Clock assumptions.
- Duplicate execution.
- Worker crash.
- Retry.
- Dead-lettering.
- Persistence.
- Failover data loss.
- Memory retention.
- Job payload storage.

For long-running, business-critical workflows, use a durable scheduler or workflow engine.

---

# Memory Design

## 131. Dataset Memory Is More Than Payload

Memory includes:

- Key bytes.
- Value bytes.
- Object metadata.
- Hash-table entries.
- Data-structure nodes.
- TTL metadata.
- Allocator overhead.
- Fragmentation.
- Client buffers.
- Replication backlog.
- Persistence buffers.
- Module indexes.

Do not estimate only serialized payload bytes.

Measure representative keys with:

```text
MEMORY USAGE
```

and production-like serialization.


<!-- IMAGE PLACEHOLDER
Title: Redis memory anatomy
What to use: A stacked memory diagram including key bytes, value bytes, object metadata, hash-table entries, allocator overhead, fragmentation, TTL metadata, client buffers, replication backlog, persistence buffers, and COW headroom.
Preferred source: Redis official “Memory optimization”, MEMORY USAGE, and INFO documentation.
Search terms: site:redis.io/docs Redis memory overhead fragmentation replication backlog COW diagram
Purpose: Prevent payload-only capacity estimates.
Alt text: Redis memory includes dataset payload plus metadata, fragmentation, client, replication, persistence, and copy-on-write overhead.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 132. Capacity Formula

```text
dataset memory
= key count
× measured average memory per key
```

```text
provisioned RAM
= dataset memory
+ replication/persistence buffers
+ fragmentation allowance
+ fork copy-on-write allowance
+ client buffers
+ operational headroom
```

For a cluster:

```text
primary memory
= total primary dataset / shard count
```

Every replica needs approximately another copy of its primary shard's dataset.

## 133. Example Memory Calculation

Assume:

```text
Active sessions              = 50 million
Measured memory per session  = 600 bytes
Replica factor               = 1 replica per primary
Target dataset utilization   = 60%
Shard usable dataset memory  = 24 GB
```

Primary logical dataset:

```text
50,000,000 × 600
= 30,000,000,000 bytes
≈ 30 GB
```

At 60% target utilization:

```text
30 GB / 0.60
= 50 GB of primary-shard capacity
```

Number of primary shards:

```text
50 GB / 24 GB
≈ 2.1
```

Round to at least `3 primary shards`.

With one replica per primary:

```text
3 primaries + 3 replicas = 6 Redis nodes
```

Then validate traffic, fork/COW behavior, hot keys and growth.


<!-- IMAGE PLACEHOLDER
Title: Redis memory-to-shard sizing example
What to use: A calculation flow diagram: live keys × measured bytes/key -> logical memory -> divide by target utilization -> primary shard count -> add one replica per primary -> total nodes.
Preferred source: Create an original diagram from the capacity calculation in this section.
Search terms: Redis memory capacity planning shard count replica diagram
Purpose: Turn the numerical capacity formula into a reusable interview visual.
Alt text: Redis capacity planning converts live-key memory into primary shards and replicated node count.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 134. Target Memory Utilization

Do not operate Redis at nearly 100% host RAM.

A conservative starting target for a persisted or replicated deployment is often around:

```text
50–70% of host RAM for the dataset limit
```

The exact target depends on persistence, write rate, fragmentation, client buffers and hosting model.

## 135. Memory Fragmentation

Redis allocates and frees many objects over time.

```text
RSS > logical allocated memory
```

can indicate fragmentation or allocator-retained memory.

Monitor:

- `used_memory`.
- `used_memory_rss`.
- Fragmentation ratio.
- Active defragmentation.
- Object churn.
- Big-key deletion.

## 136. Big Keys

A big key is a key whose value is operationally large.

Examples:

- Hash with millions of fields.
- List with millions of entries.
- Set with millions of members.
- 100 MB string.
- Global sorted set.
- Untrimmed stream.

Problems:

- Slow commands.
- Network spikes.
- Replication lag.
- Failover and resync cost.
- Deletion latency.
- Uneven shards.
- Backup latency.


<!-- IMAGE PLACEHOLDER
Title: Big key operational impact
What to use: A central huge hash/list/set/stream connected to slow commands, large network response, replication lag, deletion pause, uneven shard memory, and long recovery.
Preferred source: Redis official latency and memory-optimization documentation, including big-key tooling.
Search terms: site:redis.io/docs Redis big keys latency replication deletion diagram
Purpose: Show that big keys are a latency and availability problem, not only a storage problem.
Alt text: One oversized Redis key creates latency, replication, deletion, recovery, and shard-balance problems.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 137. Big-Key Mitigation

- Split by time.
- Split by tenant.
- Hash-shard members.
- Bound lists and streams.
- Store large blobs in object storage.
- Use pagination.
- Delete asynchronously with `UNLINK` where appropriate.
- Avoid returning the full value.
- Monitor top keys by memory and cardinality.

## 138. Hot Keys

A hot key receives disproportionate traffic.

Mitigations for reads:

- Local in-process cache.
- Replicated logical copies.
- Client-side caching.
- CDN where appropriate.
- Read replica with accepted staleness.

Mitigations for writes:

- Sharded counters.
- Batch updates.
- Local aggregation.
- Partition by dimension.
- Redesign global state.


<!-- IMAGE PLACEHOLDER
Title: Hot key versus big key
What to use: A side-by-side comparison: a tiny key receiving huge QPS versus a huge key receiving moderate traffic. Show distinct detection metrics and mitigations for each.
Preferred source: Redis official latency, cluster, and memory documentation; create an original comparison graphic.
Search terms: Redis hot key vs big key diagram
Purpose: Prevent the common confusion between traffic concentration and value size.
Alt text: A hot key is overloaded by traffic while a big key is oversized in memory or cardinality.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 139. Small Keys and Overhead

Millions of tiny keys can be less memory efficient than grouping related values in hashes.

Instead of:

```text
user:1:name
user:1:country
user:1:plan
```

consider:

```text
HSET user:1 name ... country ... plan ...
```

Trade-offs:

- Key-level TTL becomes object-level TTL.
- A hash can become a big key if over-grouped.

---

# Performance and Latency

## 140. No Universal QPS Number

Redis throughput depends on:

- Command.
- Value size.
- Pipeline size.
- Network.
- CPU.
- TLS.
- Persistence.
- Replication.
- Connections.
- Cluster shard count.
- Hot keys.
- Response size.

Do not state:

```text
Redis always handles 100,000 QPS per node.
```

Use a benchmarked sustainable rate for the actual command mix.

## 141. Interview Throughput Estimate

Example:

```text
Peak application operations = 600,000/s
Measured safe throughput per primary shard = 80,000/s
```

```text
shards for throughput
= 600,000 / 80,000
= 7.5
```

Round to `8` or more primaries, then include failure headroom and growth.

The `80,000/s` value is an explicit benchmark assumption.

## 142. Latency Targets

Example HLD targets:

```text
Redis GET/SET within one region:
p99 < 5 ms from application

Rate-limit decision:
p99 < 5 ms

Leaderboard top 100:
p99 < 10 ms
```

End-to-end latency includes network, queueing, serialization, TLS and application runtime.

## 143. Tail Latency Sources

- Slow `O(N)` command.
- Huge response.
- Fork pause.
- Copy-on-write pressure.
- AOF fsync or rewrite.
- RDB save.
- Full resynchronization.
- Network congestion.
- CPU saturation.
- Memory swapping.
- Hot key.
- Large deletion.
- Long Lua script.
- Client output-buffer growth.


<!-- IMAGE PLACEHOLDER
Title: Redis latency-spike causes
What to use: A fishbone or causal diagram grouping latency causes into command complexity, persistence/fork, memory/swapping, replication/resync, network, clients, and hot keys.
Preferred source: Redis official documentation, “Diagnosing latency issues”.
Search terms: site:redis.io/docs Redis latency fork AOF slow command hot key diagram
Purpose: Provide an operational debugging map for interview discussions.
Alt text: Redis tail latency can originate from commands, persistence, memory, replication, network, clients, or skewed keys.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 144. Avoid Swapping

If the OS swaps Redis pages to disk:

- Latency becomes unpredictable.
- Throughput collapses.
- Failures can cascade.

Provision enough RAM and monitor host memory pressure.

## 145. Connection Management

Too few connections cause client queueing.

Too many connections increase:

- File descriptors.
- Per-client memory.
- TLS overhead.
- Connection storms.
- Event-loop work.

Benchmark pool size, timeout and reconnection behavior.


---

# Failure Scenarios

## 146. Cache Node Is Unavailable

If Redis is only a cache:

```text
Redis miss/failure -> database fallback
```

Risks:

- Database overload.
- Latency spike.
- Retry storm.

Mitigations:

- Circuit breaker.
- Request coalescing.
- Local cache.
- Stale data.
- Rate limiting.
- Load shedding.
- Redis HA.
- Backend degraded-mode capacity.


<!-- IMAGE PLACEHOLDER
Title: Redis outage degraded-mode architecture
What to use: A failure-flow diagram showing Redis unavailable, circuit breaker opening, local/stale cache serving, bounded database fallback, request coalescing, rate limiting, and load shedding.
Preferred source: Redis high-availability documentation and original resilience pattern diagram.
Search terms: Redis cache outage degraded mode circuit breaker stale cache load shedding diagram
Purpose: Show how to prevent a Redis outage from taking down the source database.
Alt text: During Redis failure, resilience controls limit database fallback and serve stale or degraded responses.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 147. Primary Fails with Sentinel

Expected:

1. Clients see errors or timeouts.
2. Sentinels agree on failure.
3. Replica is promoted.
4. Clients discover the new primary.
5. Traffic resumes.

Possible issues:

- Recent write loss.
- Duplicate retries.
- Client using old primary.
- Replica too stale to promote.
- Sentinel majority unavailable.
- Insufficient capacity on the promoted node.


<!-- IMAGE PLACEHOLDER
Title: Sentinel failure timeline and client-visible effects
What to use: A time-axis diagram showing primary failure, detection timeout, failover election, replica promotion, DNS/client rediscovery, retries, and service recovery. Mark the possible write-loss and unavailability windows.
Preferred source: Redis official Sentinel documentation.
Search terms: site:redis.io/docs Redis Sentinel failover timeline downtime data loss window
Purpose: Tie Sentinel internals to user-visible latency and errors.
Alt text: Sentinel failover includes detection, election, promotion, client reconnection, temporary unavailability, and possible write loss.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 148. Primary Fails in Redis Cluster

If an eligible replica exists and a majority of primaries can authorize failover:

- Replica takes over the failed primary's slots.
- Clients refresh routing.
- Recent writes may be lost.

If no replica exists for the shard, those slots are unavailable.


<!-- IMAGE PLACEHOLDER
Title: Redis Cluster failure matrix
What to use: A compact matrix or topology graphic showing outcomes for primary failure with healthy replica, primary plus replica failure, majority-primary loss, and minority network partition.
Preferred source: Redis official Cluster documentation and cluster specification.
Search terms: site:redis.io/docs Redis Cluster failure scenarios primary replica majority diagram
Purpose: Summarize when one shard or the entire cluster remains available.
Alt text: Redis Cluster availability depends on replica health and a reachable majority of primary nodes.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 149. Primary and Replica Fail

With one replica per primary:

```text
primary + its replica unavailable
```

The shard has no serving copy.

Redis Cluster cannot reconstruct the shard from unrelated nodes.

Use:

- Independent failure domains.
- More replicas where required.
- Backups.
- Tested restore.
- Managed cross-zone deployment.

## 150. Network Partition

Sentinel:

- Majority-side Sentinels may promote a replica.
- Old primary may continue briefly until clients stop using it.
- Split-brain writes can be lost when topology converges.

Cluster:

- Majority of primaries drives failover.
- Minority-side writes have greater loss risk.
- Cluster may reject operations after partition detection.


<!-- IMAGE PLACEHOLDER
Title: Network partition and split-brain risk
What to use: A majority/minority partition diagram for Sentinel or Cluster showing promotion on the majority side, an old primary briefly accepting writes on the minority side, and those writes being discarded after convergence.
Preferred source: Redis official Sentinel and Cluster specification pages.
Search terms: site:redis.io/docs Redis network partition split brain minority writes diagram
Purpose: Explain why asynchronous failover can lose writes accepted on an isolated side.
Alt text: A Redis network partition creates majority-side failover while minority-side writes may later be lost.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 151. Redis Restarts Without Persistence

All in-memory data is lost.

This is acceptable only when:

- Redis is a rebuildable cache.
- Refill load is controlled.
- Source database can handle recovery.
- Warmup time is acceptable.

## 152. AOF Every-Second Crash

A process or machine crash can lose recent operations that were not fsynced.

State this explicitly:

```text
expected durability window: approximately up to one second,
subject to operating-system and failure behavior
```

## 153. OOM and `noeviction`

When `maxmemory` is reached:

- Reads can continue.
- Memory-growing writes fail.
- The application receives an error.
- Existing business workflows may fail.

Monitor memory before this threshold and define:

- Alert.
- Scale-out.
- TTL correction.
- Traffic reduction.
- Emergency cleanup.
- Safe degradation.

## 154. OOM with Eviction

Redis removes keys according to policy.

For a cache:

- Hit ratio decreases.
- Backend load rises.

For critical state:

- Business data may disappear.

Never combine critical non-rebuildable state with an eviction policy without accepting the data-loss semantics.

## 155. Huge Key Deleted

`DEL` may synchronously free a large object and cause latency.

Use asynchronous deletion where supported:

```text
UNLINK key
```

Still account for background memory reclamation and replica propagation.

## 156. Long-Running Script

A long script blocks command execution on the shard.

Symptoms:

- Latency spike.
- Timeouts.
- Replication lag.
- Failover instability.
- Retry storm.

Scripts must have bounded loops and bounded key counts.

---

# Multi-Region Design

## 157. Redis Open Source Replication

Ordinary Redis Open Source replication is primary-replica and not a general active-active multi-primary conflict-resolution system.

A common architecture is:

```text
Region A: writable primary
Region B: replica or disaster-recovery copy
```

Cross-region replication adds:

- WAN lag.
- Failover data-loss window.
- Promotion complexity.
- Client rerouting.
- DNS or service-discovery changes.

## 158. Active-Active Redis

Active-active geo-distributed Redis capabilities are associated with Redis commercial or managed offerings and conflict-free replicated data types.

Do not assume an ordinary Redis Cluster provides cross-region multi-primary writes with automatic value merging.

For interviews, state which product model is being used:

```text
Redis Open Source Sentinel/Cluster
or
managed Redis active-active capability
```

## 159. Regional Cache Pattern

Most systems do not need global Redis state.

Use one Redis deployment per region:

```text
application in region -> regional Redis -> global source database
```

Advantages:

- Low latency.
- Failure isolation.
- No cross-region Redis round trip.
- Cache values can differ temporarily.

This is ideal for rebuildable caches.


<!-- IMAGE PLACEHOLDER
Title: Regional Redis caches
What to use: A multi-region architecture with one independent Redis deployment per region, regional application servers, and a shared or replicated source database. Show local cache hits and region-isolated cache failure.
Preferred source: Redis deployment and high-availability documentation; create an original regional-cache diagram.
Search terms: Redis regional cache architecture multi region local latency diagram
Purpose: Show the preferred multi-region pattern for rebuildable cached data.
Alt text: Each region uses its own low-latency Redis cache while durable data remains in a shared source of truth.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 160. Region-Owned Keys

For mutable state, assign a home region:

```text
user 123 -> India region
user 456 -> Europe region
```

All writes for the key go to the owner region.

## 161. Global Rate Limits

An exact global rate limit across regions requires coordination and WAN latency.

Alternatives:

- Split quota among regions.
- Use approximate local limits.
- Reconcile periodically.
- Reserve a safety margin.
- Route an identity to one home region.
- Use a globally consistent service when exactness is mandatory.

---


<!-- IMAGE PLACEHOLDER
Title: Global versus regional rate limiting
What to use: A comparison diagram: exact global counter requiring cross-region coordination versus split regional quotas with safety margin and periodic reconciliation.
Preferred source: Create an original diagram based on Redis regional deployment and rate-limiting sections.
Search terms: global rate limiter regional quotas exact approximate diagram Redis
Purpose: Explain the latency and availability cost of exact global enforcement.
Alt text: Exact global limits coordinate across regions, while regional quota allocation trades precision for low latency and availability.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
# Observability

## 162. Core Metrics

### Traffic

- Commands per second.
- Operations by command.
- Network input/output.
- Connected clients.
- Rejected connections.
- Client-output-buffer usage.

### Latency

- Command latency.
- p50, p95 and p99 application latency.
- Slowlog.
- Event-loop latency.
- Fork duration.
- AOF fsync latency.

### Cache

- Keyspace hits.
- Keyspace misses.
- Hit ratio.
- Evicted keys.
- Expired keys.
- Refill rate.
- Backend fallback rate.

### Memory

- Used memory.
- RSS.
- Fragmentation.
- `maxmemory`.
- Memory by key family.
- Big keys.
- Client memory.
- Replication backlog.
- Copy-on-write bytes.

### Persistence

- Last successful RDB save.
- RDB save duration.
- AOF rewrite status.
- AOF size.
- Fsync delay.
- Persistence errors.

### Replication

- Primary/replica role.
- Connected replicas.
- Replica lag.
- Replication offsets.
- Full vs partial resync.
- Backlog size.
- Link status.

### Cluster

- Slots assigned.
- Slots healthy.
- Failed nodes.
- Redirections.
- Resharding.
- Per-shard memory and QPS.
- Hot-slot imbalance.


<!-- IMAGE PLACEHOLDER
Title: Redis observability dashboard
What to use: A dashboard mockup with panels for operations/sec, p99 latency, hit ratio, evictions, memory/RSS, fragmentation, replication lag, persistence status, connected clients, slow commands, and per-shard imbalance.
Preferred source: Redis official INFO, latency, memory, replication, Sentinel, and Cluster documentation.
Search terms: site:redis.io/docs Redis monitoring dashboard INFO memory replication latency metrics
Purpose: Show the minimum production signals needed to operate Redis safely.
Alt text: Redis dashboard tracks traffic, latency, cache efficiency, memory, persistence, replication, and cluster health.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 163. Slowlog

Redis Slow Log records commands whose execution exceeds a threshold.

It measures server execution time, not full network round-trip time.

Use it to find:

- Large range reads.
- Huge set operations.
- Slow scripts.
- Big-key operations.
- Administrative commands.

## 164. Keyspace Sampling

Regularly inspect:

- Largest keys.
- Most accessed keys.
- Keys without TTL where TTL is expected.
- Cardinality by prefix.
- Memory by prefix.
- TTL distribution.
- Cluster slot distribution.

Do not run unsafe full-keyspace commands on a busy production server.

## 165. Alerts

Alert on:

- Memory above planned threshold.
- Rising evictions.
- Low hit ratio.
- Replica disconnected.
- Replica lag.
- Persistence failure.
- AOF rewrite failure.
- RDB save failure.
- Cluster slot failure.
- Sentinel failover.
- Slowlog growth.
- Latency spike.
- Full resynchronization.
- Fork time.
- Client-output-buffer growth.

---

# Security

## 166. Network Exposure

Do not expose Redis directly to the public internet.

Use:

- Private networks.
- Firewall rules.
- Security groups.
- TLS where required.
- Authentication.
- ACLs.
- Protected mode.
- Restricted administrative commands.
- Separate production and non-production deployments.

## 167. ACLs

Define users with only required commands and key patterns.

Example roles:

```text
cache-reader
cache-writer
rate-limiter
stream-consumer
operator
```

Least privilege reduces the effect of compromised applications.

## 168. Dangerous Operations

Restrict commands capable of:

- Flushing data.
- Changing configuration.
- Shutting down.
- Loading code.
- Scanning all keys.
- Migrating keys.
- Inspecting sensitive values.

Security design must be verified for the deployed Redis version and hosting model.

---

# Capacity Planning

## 169. Inputs

Estimate:

```text
peak operations per second
read/write ratio
commands used
average request size
average response size
key count
average measured bytes per key
TTL distribution
replica count
persistence mode
growth
hot-key skew
target memory utilization
failure headroom
```


<!-- IMAGE PLACEHOLDER
Title: Redis capacity-planning workflow
What to use: A flowchart starting from live-key count, measured memory/key, TTL, command mix, request/response size, throughput benchmark, persistence, replicas, skew, and failure headroom, ending in shard and node count.
Preferred source: Redis official memory optimization, benchmarking, persistence, and Cluster documentation; create an original flowchart.
Search terms: Redis capacity planning memory throughput shards replicas flowchart
Purpose: Provide a reusable checklist before the formulas.
Alt text: Redis capacity planning combines memory, throughput, network, persistence, replication, skew, and failure constraints.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 170. Memory Formula

```text
logical dataset memory
= number of live keys
× measured memory per key
```

```text
primary capacity required
= logical dataset memory
÷ target utilization
```

```text
total replicated memory
≈ primary capacity
× (1 + replicas per primary)
```

Physical host RAM must also include non-dataset overhead.

## 171. TTL-Based Key Count

For a steady-state expiring workload:

```text
live keys
≈ keys created per second
× average TTL in seconds
```

Example:

```text
10,000 idempotency keys/s
TTL = 24 hours = 86,400 s
```

```text
live keys
≈ 10,000 × 86,400
= 864 million keys
```

At `150 bytes` measured memory each:

```text
864,000,000 × 150
≈ 129.6 GB
```

before additional headroom and replicas.


<!-- IMAGE PLACEHOLDER
Title: Steady-state TTL key population
What to use: A timeline showing keys created continuously, keys expiring after a fixed TTL, and the steady-state live-key band equal to creation rate multiplied by average TTL.
Preferred source: Create an original diagram based on Redis expiration behavior.
Search terms: Redis live keys creation rate times TTL steady state diagram
Purpose: Make the live-key formula intuitive for idempotency, sessions, and rate-limit keys.
Alt text: At steady state, Redis retains roughly the key creation rate multiplied by average TTL.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 172. Cache Size by Working Set

Do not always cache the entire database.

Estimate the hot working set:

```text
daily accessed objects
× average cached bytes
```

Then validate expected hit ratio under the selected eviction policy.

## 173. Network Capacity

```text
network ingress
= operations/s × average request bytes
```

```text
network egress
= operations/s × average response bytes
```

Replication adds outbound traffic from primaries.

Example:

```text
200,000 GET/s
average response = 2 KB
```

```text
egress ≈ 400 MB/s
```

before protocol and network overhead.

## 174. Shards for Memory

```text
primary shards for memory
= required primary capacity
÷ usable memory per primary shard
```

Round up and account for uneven distribution.

## 175. Shards for Throughput

```text
primary shards for throughput
= peak operations/s
÷ benchmarked safe operations/s per shard
```

Use the larger of memory and throughput requirements.

## 176. Failure Headroom

The promoted replica must have:

- Sufficient CPU.
- Sufficient network.
- Correct persistence configuration.
- Independent failure domain.
- Capacity for full traffic.

Keep additional headroom for maintenance and resharding.

## 177. Full Example

Assume:

```text
Peak requests                  = 1,000,000/s
Redis operations per request  = 1.2
Peak Redis operations         = 1,200,000/s

Live keys                     = 200 million
Measured memory per key       = 400 bytes
Primary dataset               = 80 GB

Target primary utilization    = 60%
Usable dataset per shard      = 20 GB
Measured safe throughput      = 100,000 ops/s per primary
Replica per primary           = 1
```

Memory requirement:

```text
80 GB / 0.60
≈ 133 GB primary capacity
```

Primary shards for memory:

```text
133 / 20
≈ 6.65
=> 7 shards
```

Primary shards for throughput:

```text
1,200,000 / 100,000
= 12 shards
```

Choose at least:

```text
12 primaries
12 replicas
= 24 Redis nodes
```

Then add growth, hot-key risk, persistence overhead and spare capacity.

The throughput value is a benchmark assumption, not a product guarantee.

---


<!-- IMAGE PLACEHOLDER
Title: Redis Cluster sizing example
What to use: A final architecture based on the section’s calculation: twelve primary shards, one replica per primary, spread across three availability zones. Annotate memory and throughput constraints and failover placement.
Preferred source: Create an original architecture diagram from the numerical example.
Search terms: Redis Cluster capacity planning 12 primaries 12 replicas availability zones diagram
Purpose: Connect the arithmetic to a concrete deployable topology.
Alt text: A 24-node Redis Cluster uses twelve primaries and twelve replicas distributed across availability zones.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
# Common Redis Designs

## 178. Product Cache

Key:

```text
product:<product-id>
```

Pattern:

```text
cache-aside
TTL = 5–30 minutes with jitter
delete on product update
negative cache missing IDs
single-flight hot misses
```

Do not cache highly volatile inventory in the same long-lived object unless staleness is acceptable.


<!-- IMAGE PLACEHOLDER
Title: Production-grade product cache
What to use: An end-to-end sequence showing request, L1 local cache, L2 Redis, database fallback, cache fill with TTL jitter, negative caching, invalidation event, and single-flight on a hot miss.
Preferred source: Redis caching, Pub/Sub/client-side caching, and data-type documentation; create an original architecture diagram.
Search terms: Redis product cache L1 L2 database invalidation single flight diagram
Purpose: Combine the guide’s cache patterns into one complete HLD example.
Alt text: A product request uses local and Redis caches, database fallback, jittered TTL, invalidation, and request coalescing.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 179. URL Shortener Redirect Cache

Key:

```text
url:<short-code>
```

Value:

```text
long URL
```

Flow:

```text
GET Redis
if miss -> query database -> SET EX
redirect
```

Redis is a cache, while the durable mapping remains in a database.

## 180. Rate-Limit State

Key:

```text
rate:{user-id}:api-name
```

Use:

- Fixed window counter for simplicity.
- Token bucket for bursts.
- Sliding log for exact window.

All logic should execute atomically.


<!-- IMAGE PLACEHOLDER
Title: End-to-end distributed rate limiter with Redis
What to use: A system diagram with API gateway, rate-limiter service or library, Redis Cluster, Lua/Function atomic check, local fallback policy, rule configuration store, and asynchronous usage analytics.
Preferred source: Redis official rate-limiter tutorials, Cluster, and scripting documentation.
Search terms: Redis distributed rate limiter architecture API gateway cluster Lua analytics
Purpose: Show Redis’s role in the full rate-limiting system rather than only the algorithm.
Alt text: An API gateway performs an atomic rate-limit check in Redis while rules and analytics use separate durable paths.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 181. Login Attempts

```text
INCR login-fail:user:123
EXPIRE login-fail:user:123 900
```

On success:

```text
DEL login-fail:user:123
```

Use atomic logic to ensure TTL is set.

## 182. Shopping Cart

```text
HINCRBY cart:123 product:99 1
HDEL cart:123 product:99
EXPIRE cart:123 2592000
```

Durability decision:

- Cache of cart persisted elsewhere.
- Redis primary cart store with AOF and replication.
- Event-driven durable cart history.

Do not silently evict an authoritative shopping cart.


<!-- IMAGE PLACEHOLDER
Title: Redis shopping-cart storage options
What to use: A comparison of cart as a Redis hash cache backed by a database, Redis as primary cart store with AOF/replication, and event-sourced durable cart with Redis materialized state.
Preferred source: Redis hashes, persistence, and replication documentation.
Search terms: Redis shopping cart hash persistence architecture diagram
Purpose: Force an explicit source-of-truth and durability decision for cart data.
Alt text: Shopping carts can be cached, stored primarily in persisted Redis, or derived from durable events.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 183. Notification Badge Counter

```text
INCR unread:user:123
DECR unread:user:123
```

Risk:

- Retries.
- Events arriving out of order.
- Counter drift.

Use Redis as a materialized fast view and periodically reconcile when correctness matters.

## 184. Online Presence

```text
SET presence:user:123 <server-id> EX 30
```

Refresh every 10 seconds.

Staleness:

```text
up to approximately 30 seconds
```

Presence should be treated as approximate.

## 185. Top-K Trending Items

```text
ZINCRBY trending:hour:<bucket> <weight> <item-id>
```

At window close:

- Read top candidates.
- Merge across shards or buckets.
- Expire old bucket.

For high ingestion, aggregate locally or through a stream before Redis.


<!-- IMAGE PLACEHOLDER
Title: Streaming Top-K with Redis sorted sets
What to use: A pipeline showing user events to Kafka/stream processor, local aggregation, batched ZINCRBY into time-bucketed sorted sets, expiry of old buckets, and top-K reads.
Preferred source: Redis sorted-set and Streams documentation; Apache Kafka documentation for the event pipeline.
Search terms: Redis trending top K sorted set stream aggregation architecture diagram
Purpose: Show a scalable alternative to writing every event directly into one hot sorted set.
Alt text: Events are aggregated before updating time-bucketed Redis sorted sets used for top-K queries.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 186. Distributed Cache for Database Rows

Key:

```text
table:<primary-key>:<version>
```

Requirements:

- Clear source of truth.
- TTL.
- Invalidation.
- Schema/version.
- Compression decision.
- Negative cache.
- Stampede control.
- Failover behavior.

## 187. Feature Flags

Redis can serve low-latency flags:

```text
HGET flags:tenant:123 checkout-v2
```

Use:

- Durable configuration elsewhere.
- Local in-process cache.
- Redis Pub/Sub invalidation.
- Versioned snapshots.
- Safe defaults when Redis is unavailable.

---

# Redis vs Other Systems

## 188. Comparison Table

| System | Best at | Main limitation compared with Redis |
|---|---|---|
| PostgreSQL | Transactions, joins and durable system of record | Higher latency for hot simple state |
| Memcached | Simple distributed cache | Fewer data structures, persistence and HA capabilities |
| Cassandra | Durable high-write, large distributed data | Higher latency and no in-memory data-structure richness |
| Kafka | Durable event log and replay | Not a low-latency random-access cache |
| DynamoDB | Managed durable key-value scale | Higher latency and different cost model |
| ClickHouse | Analytical scans and aggregation | Not a hot-state cache or atomic counter server |
| Elasticsearch | Search | Not a simple low-latency coordination store |
| Redis | Low-latency data structures and hot state | Memory cost and asynchronous durability/failover semantics |


<!-- IMAGE PLACEHOLDER
Title: Redis database-selection matrix
What to use: A matrix comparing Redis, PostgreSQL, Cassandra, Kafka, ClickHouse, Elasticsearch, DynamoDB, and Memcached across latency, durability, query flexibility, memory cost, scaling, and ideal use case.
Preferred source: Use official product documentation for each system; create an original matrix rather than copying vendor marketing graphics.
Search terms: Redis PostgreSQL Cassandra Kafka ClickHouse comparison matrix latency durability
Purpose: Help interview candidates justify choosing Redis instead of naming it by habit.
Alt text: Database-selection matrix compares Redis with transactional, analytical, streaming, search, and cache systems.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 189. Redis vs Memcached

Choose Memcached when:

- Only simple cache get/set is required.
- No persistence.
- No advanced data structures.
- Operational simplicity is preferred.

Choose Redis when:

- Counters, sets or sorted sets are required.
- Persistence or replication is useful.
- Streams, Pub/Sub or scripts are required.
- Cluster-aware sharding is required.

## 190. Redis vs PostgreSQL

Choose Redis for:

- Cache.
- Sessions.
- Rate limiting.
- Counters.
- Leaderboards.
- Short-lived state.
- Hot read models.

Choose PostgreSQL for:

- Source of truth.
- Transactions.
- Constraints.
- Joins.
- Auditable durable records.
- Flexible queries.

Common architecture:

```text
PostgreSQL -> durable truth
Redis      -> hot derived state
```

## 191. Redis vs Cassandra

Choose Redis when:

- Working set fits memory.
- Very low latency is central.
- Atomic counters or sorted sets are required.
- TTL state is short-lived.
- Data can be rebuilt.

Choose Cassandra when:

- Data is much larger than memory.
- Long retention is required.
- Durable write throughput is central.
- Queries are partition-oriented.
- Multi-region event storage is required.

## 192. Redis vs Kafka

Choose Redis Streams or Pub/Sub when:

- Very low latency.
- Short retention.
- Moderate queue size.
- Redis already exists.

Choose Kafka when:

- Durable replay.
- Long retention.
- Large event volume.
- Many consumer groups.
- Disk-backed log.
- Stream-processing ecosystem.

## 193. Redis vs DynamoDB

Choose Redis when:

- Very low-latency hot access matters.
- Rich server-side data structures matter.
- Cache semantics and TTL are central.

Choose DynamoDB when:

- Managed durable key-value storage is required.
- Dataset is much larger than memory.
- AWS integration and managed scaling are preferred.

A common design uses DynamoDB as truth and Redis as cache.

## 194. Redis vs Local In-Process Cache

Local cache:

- No network hop.
- Lowest latency.
- No shared state.
- Per-instance duplication.
- Harder invalidation.

Redis:

- Shared across application instances.
- Centralized TTL and eviction.
- Network hop.
- HA and scaling required.

Use both when useful:

```text
L1 local cache
L2 Redis
database
```

---


<!-- IMAGE PLACEHOLDER
Title: L1 local cache plus L2 Redis
What to use: A layered cache architecture showing per-instance local cache, shared Redis, source database, invalidation events, and different TTL/staleness windows for L1 and L2.
Preferred source: Redis client-side caching and Pub/Sub documentation; create an original layered-cache diagram.
Search terms: Redis L1 local cache L2 distributed cache invalidation diagram
Purpose: Explain why local cache and Redis are complementary rather than mutually exclusive.
Alt text: Application instances use a local L1 cache before shared Redis L2 and the source database.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
# Common Mistakes

## 195. Treating Redis as Infinitely Fast

Some commands are `O(N)` or return huge results. One shard has finite CPU, memory and network capacity.

## 196. No `maxmemory`

A cache without an intentional memory limit can consume host RAM and trigger swapping or OOM termination.

## 197. Eviction on Critical Data

Bad:

```text
authoritative session/cart/payment state
with allkeys-lru
```

Use separate deployments and `noeviction` for non-rebuildable state.

## 198. One Giant Key

Bad:

```text
one set containing every user
one sorted set containing every event
one stream retained forever
```

A cluster cannot shard one key.

## 199. `KEYS *` in Production

It can block the server while scanning the full keyspace.

Use controlled `SCAN` and observability tooling.

## 200. Unbounded Stream or List

Every queue or history requires retention, trimming, consumer-lag monitoring and failure recovery.

## 201. Non-Atomic Lock Release

Bad:

```text
GET lock
if token matches:
    DEL lock
```

Use an atomic script.

## 202. Lock Without Fencing

A lease can expire while the old owner is paused.

For correctness-critical resources, use fencing tokens or stronger coordination.

## 203. Assuming Replica Reads Are Fresh

Redis replicas are asynchronous.

Use the primary for read-after-write correctness.

## 204. Claiming `WAIT` Gives Strong Consistency

`WAIT` improves replica acknowledgement but does not create consensus.

## 205. Pipelining Millions of Commands

Huge pipelines consume buffers and create latency spikes.

Use bounded batches and backpressure.

## 206. Retry Without Idempotency

A timeout does not prove a command failed.

Unsafe retries include:

- `INCR`.
- `LPUSH`.
- `ZINCRBY`.
- External side effect after lock acquisition.

## 207. Mixing Cache and Queue on One Instance

A cache eviction storm, big queue or long script can affect unrelated workloads.

Separate Redis deployments when memory and failure policies differ.

## 208. Ignoring Persistence Fork Headroom

The dataset fits under `maxmemory`, but snapshot or rewrite copy-on-write pushes the host into OOM.

Measure persistence under peak write load.

## 209. No Degraded Mode

If Redis fails and every request hits the database, the database may fail too.

Define fallback, circuit breaker, stale data, rate limits and load shedding.

## 210. Cluster Without Cluster-Aware Client

Use a supported cluster client that handles slot discovery and redirections.

## 211. Overusing Hash Tags

Hash tags enable atomic multi-key operations but can create a hot slot.

---

# Interview Decision Framework

## 212. Choose Redis When

```text
[ ] Very low latency is required.
[ ] The hot dataset fits in memory.
[ ] Access is primarily by key.
[ ] TTL and expiration are useful.
[ ] Atomic counters or data structures simplify the design.
[ ] Data can be rebuilt, or persistence trade-offs are acceptable.
[ ] Replica staleness and failover loss are understood.
[ ] The keyspace can be distributed without severe hot keys.
[ ] Memory cost is acceptable.
```


<!-- IMAGE PLACEHOLDER
Title: Should I use Redis?
What to use: A decision tree asking: Is very low latency required? Does the hot state fit memory? Is access key-based? Is data rebuildable? Are asynchronous replication and eviction semantics acceptable? Do rich data structures help?
Preferred source: Create an original decision tree based on this guide and official Redis capability documentation.
Search terms: should I use Redis decision tree cache database rate limiter leaderboard
Purpose: Provide a concise interview selection framework.
Alt text: Decision tree determines whether Redis is suitable based on latency, memory, access pattern, durability, and data-structure needs.
Editorial note: Verify image licensing before publishing. Prefer official Redis documentation; otherwise create an original diagram based on the cited official pages.
-->
## 213. Avoid Redis When

```text
[ ] Data must never lose acknowledged writes.
[ ] Cross-shard strong transactions are required.
[ ] The dataset is mostly cold and very large.
[ ] Queries require joins or arbitrary filters.
[ ] Long-term event retention is central.
[ ] Exactly-once messaging is required.
[ ] One giant data structure dominates the workload.
[ ] The design depends on a lock without fencing for critical correctness.
```

## 214. Redis Design Checklist

```text
[ ] Is Redis a cache, derived store or source of truth?
[ ] What is the exact key format?
[ ] Which data structure is used?
[ ] What is the command complexity?
[ ] What is the maximum value/cardinality?
[ ] Is TTL required?
[ ] What is the eviction policy?
[ ] What happens at maxmemory?
[ ] Is persistence required?
[ ] What is the accepted data-loss window?
[ ] Is replication required?
[ ] Sentinel or Cluster?
[ ] Can reads use replicas?
[ ] Are retries idempotent?
[ ] Can a hot key occur?
[ ] Can a big key occur?
[ ] How is cache stampede prevented?
[ ] What is the fallback when Redis is unavailable?
[ ] What is the memory estimate?
[ ] What is the benchmarked per-shard throughput?
[ ] How are backups and restore tested?
```

---

# Interview Questions and Answers

## 215. Why Is Redis Fast?

Redis keeps data in memory, uses efficient specialized data structures, serializes core command execution and supports pipelining to reduce network round trips.

## 216. Is Redis Single-Threaded?

Core command execution is serialized on each Redis server or shard. Redis can use other threads or processes for networking and background operations. A slow command can still block other clients on that shard.

## 217. Is Redis Only a Cache?

No. Redis can store counters, sets, sorted sets, streams, sessions and other state. It can be a primary store for selected workloads, but persistence, replication, eviction and failover-loss semantics must match the requirement.

## 218. What Is the Difference Between Expiration and Eviction?

Expiration removes a key after its TTL. Eviction removes a key because the memory limit is reached.

## 219. Which Eviction Policy Should Be Used?

For a pure cache, `allkeys-lru` or `allkeys-lfu` is a common starting point. For non-rebuildable data, use `noeviction` and sufficient capacity.

## 220. RDB vs AOF?

RDB creates point-in-time snapshots and can lose data since the last snapshot. AOF logs writes and can reduce the loss window, with performance depending on fsync policy. They can be used together.

## 221. What Does `appendfsync everysec` Mean?

Redis fsyncs AOF approximately every second. It balances performance and durability but can lose roughly the most recent second of writes during a severe crash.

## 222. Does Replication Make Redis Strongly Consistent?

No. Redis Open Source replication is asynchronous by default. A promoted replica may be missing recent acknowledged writes.

## 223. What Does `WAIT` Guarantee?

It waits for a requested number of replicas to acknowledge receiving prior writes. It reduces the replication-loss window but does not create a consensus-based strongly consistent system.

## 224. Sentinel vs Redis Cluster?

Sentinel provides automatic failover for one unsharded primary-replica dataset. Redis Cluster shards data across multiple primaries and provides per-shard failover.

## 225. How Does Redis Cluster Shard Data?

It maps keys to one of 16,384 hash slots using a CRC16-based calculation. Each primary owns a subset of slots.

## 226. What Are Hash Tags?

The substring inside `{}` controls slot calculation.

```text
user:{123}:profile
user:{123}:cart
```

Both map to the same slot.

## 227. What Is a Hot Key?

A key receiving disproportionate traffic. It overloads one Redis shard because one key cannot be split automatically.

## 228. What Is a Big Key?

A key with a very large value or cardinality that causes latency, memory, network, replication or failover problems.

## 229. How Do You Prevent Cache Stampede?

Use single-flight/request coalescing, per-key locks, refresh-ahead, stale-while-revalidate, TTL jitter and bounded backend fallback.

## 230. What Is Cache Penetration?

Repeated requests for nonexistent data bypass the cache and hit the database. Use negative caching, validation, Bloom filters and rate limiting.

## 231. What Is Cache Avalanche?

Many keys expire or Redis fails at the same time, causing a backend traffic spike. Use TTL jitter, HA, circuit breakers, stale serving, warming and load shedding.

## 232. Is `MULTI/EXEC` a Full ACID Transaction?

No. It serializes queued commands during execution but does not provide relational rollback semantics.

## 233. When Should Lua Be Used?

Use Lua or Redis Functions when multiple reads and writes must execute atomically in one bounded server-side operation.

## 234. Pipelining vs Transaction?

Pipelining reduces network round trips but is not atomic. A transaction serializes queued commands during execution.

## 235. Pub/Sub vs Streams?

Pub/Sub is live, at-most-once and non-retained. Streams retain entries, support consumer groups, acknowledgement and pending-message recovery.

## 236. Redis Streams vs Kafka?

Redis Streams fits short-lived low-latency queues with moderate retention. Kafka is better for large durable logs, long retention, replay and many consumer groups.

## 237. How Do You Implement a Redis Lock?

Acquire with:

```text
SET key unique-token NX PX lease
```

Release with an atomic token-check-and-delete script. For correctness-critical resources, add fencing tokens or use stronger coordination.

## 238. Why Is `SETNX` Followed by `EXPIRE` Unsafe?

The process can crash after `SETNX` and before `EXPIRE`, leaving a permanent lock. Use one atomic `SET ... NX PX` command.

## 239. Why Are Fencing Tokens Needed?

A client can continue acting after its lease expires. A fencing token lets the protected resource reject operations from an older owner.

## 240. How Would You Implement a Rate Limiter?

Use a fixed-window counter, sliding-window log, sliding-window counter, token bucket or leaky bucket. Execute the update atomically with a script or Function.

## 241. Redis or Cassandra for Rate Limiting?

Redis is better for the hot decision path because it provides low-latency atomic counters and expiry. Cassandra is better for durable usage history or audit events.

## 242. Redis or PostgreSQL for Sessions?

Redis is better for fast expiring centralized sessions. PostgreSQL provides stronger durability and transactions. Many systems use Redis for active sessions and keep durable user/security state in PostgreSQL.

## 243. What Happens When Redis Reaches `maxmemory`?

With an eviction policy, Redis removes keys according to that policy. With `noeviction`, memory-growing writes fail while reads can continue.

## 244. Why Should Redis Not Swap?

Swapping turns memory access into disk access, causing severe unpredictable latency and throughput collapse.

## 245. How Do You Scale Redis?

- Scale up one server.
- Add replicas for selected stale reads.
- Use Redis Cluster to add primary shards.
- Partition hot logical keys in the application.
- Use pipelining.
- Reduce payload size.
- Separate workloads.

## 246. Does Adding Cluster Nodes Fix a Hot Key?

No. One key maps to one hash slot and one primary. The logical key must be sharded or redesigned.

## 247. How Do You Estimate Redis Memory?

Measure representative keys with `MEMORY USAGE`, multiply by expected live key count, and add headroom for fragmentation, client buffers, replication, persistence and fork copy-on-write.

## 248. What Happens During Sentinel Failover?

Sentinels detect primary failure, agree through quorum and majority authorization, promote a replica, reconfigure other replicas and inform clients. Recent writes may be lost.

## 249. What Happens During Redis Cluster Failover?

A replica of the failed primary is elected and takes ownership of its hash slots. Clients refresh slot routing. Failover requires a healthy cluster majority and eligible replica.

## 250. What Is the Biggest Redis Design Mistake?

Treating Redis as a magical low-latency black box without defining memory limits, failure semantics, data-loss tolerance, key distribution and degraded behavior.

---

# Thirty-Second Summary

```text
Redis is an in-memory key-value and data-structure server.

It is best for:
- Cache.
- Sessions.
- Rate limiting.
- Counters.
- Leaderboards.
- Short-lived state.
- Low-latency queues and notifications.

Its core design rules are:
- Choose the correct data structure.
- Keep commands and results bounded.
- Set maxmemory intentionally.
- Separate cache data from critical data.
- Define TTL and eviction.
- Understand RDB/AOF durability.
- Understand asynchronous replication.
- Use Sentinel for unsharded HA.
- Use Redis Cluster for sharding.
- Prevent hot keys and big keys.
- Make retries idempotent.
- Define the fallback when Redis is unavailable.

Do not use Redis by default for:
- Large cold datasets.
- Joins.
- Cross-shard transactions.
- Exactly-once messaging.
- Financial ledgers.
- Correctness-critical locks without fencing.
```

<!--
EDITORIAL SOURCES TO VERIFY BEFORE PUBLISHING

Use the current official Redis documentation as the primary source:

- About Redis
- Redis data types
- Key eviction
- Redis persistence
- Redis replication
- High availability with Redis Sentinel
- Scale with Redis Cluster
- Redis Cluster specification
- Redis transactions
- Redis programmability: Lua scripts and Functions
- Redis Pub/Sub
- Redis Streams
- Distributed locks with Redis
- Redis client handling
- MEMORY USAGE
- Redis configuration
- Command reference and complexity

Version-sensitive notes:

- Redis Open Source configuration and bundled capabilities changed in Redis 8.
- Eviction policies available can vary by Redis version.
- Active-active geo-distributed behavior belongs to specific commercial or managed Redis offerings, not ordinary Redis Open Source Cluster.
- Persistence, failover and managed-service guarantees must be verified against the exact deployed product and version.
- QPS, latency and memory figures in this guide are interview assumptions or planning examples, not Redis guarantees.
-->
