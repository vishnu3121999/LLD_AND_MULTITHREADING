---
title: Redis for High-Level Design Interviews
slug: redis
summary: An interview-focused guide to Redis data structures, caching patterns, atomic operations, expiration, eviction, persistence, replication, clustering, capacity planning and production trade-offs.
tags:
  - hld
  - system-design
  - databases
  - caching
  - distributed-systems
  - redis
difficulty: intermediate
---

# Redis

Redis is an in-memory data store designed for workloads that need:

- Very low-latency reads and writes.
- High request throughput.
- Atomic operations on useful server-side data structures.
- Native expiration and configurable eviction.
- Simple key-based access patterns.

Redis is commonly used as a cache, session store, rate limiter, leaderboard, counter store, deduplication store, presence store and short-lived coordination layer. It can also persist data and act as a primary database for carefully chosen workloads, but durability and query requirements must be evaluated explicitly.

> **One-line interview definition:** Redis is an in-memory data-structure store that trades memory cost and limited query flexibility for low latency, atomic operations and application-friendly primitives such as counters, sets, sorted sets, streams and TTLs.
> **Main interview angle:** Do not select Redis only because it is "fast." Explain which access pattern or atomic data-structure operation makes it useful, how memory is bounded, what happens during failover and whether Redis is a cache or the system of record.

![Redis deployment mental model](./diagrams/01-redis-deployment-mental-model.png)
<!-- GENERATED EXCALIDRAW: ./diagrams/01-redis-deployment-mental-model.excalidraw -->
<!--
ORIGINAL IMAGE NOTES
Title: Redis deployment mental model
What to use: A three-panel diagram comparing a standalone Redis node, a primary with replicas and Sentinel, and a sharded Redis Cluster with one replica per primary. Show RAM as the serving layer and optional RDB/AOF files on disk.
Preferred source: Create an original diagram based on the official Redis replication, Sentinel, persistence and Cluster documentation.
Search terms: Redis replication Sentinel Cluster hash slots persistence architecture
Purpose: Establish that persistence, replication, automatic failover and sharding are separate concerns.
Alt text: Redis can run as one node, as a replicated primary with Sentinel, or as a sharded cluster with replicas and optional disk persistence.
Editorial note: Do not present Sentinel as a sharding mechanism or replicas as a substitute for persistence.
-->

## 1. Why Redis Exists

Many applications repeatedly compute or fetch small pieces of data from a slower database or remote service:

```text
application -> database query -> disk/network work -> response
```

If the same result is requested thousands of times, repeating the complete path wastes latency and backend capacity. Redis keeps the working set in memory and exposes data through direct key-based operations:

```text
application -> Redis key lookup -> response
```

Redis also moves common concurrency logic into atomic server-side operations. Instead of every application instance implementing locks around a shared counter, the application can use commands such as `INCR`, `SET ... NX`, `SADD` or `ZADD`.

Redis therefore solves two different problems:

1. **Acceleration:** Serve frequently accessed data without repeatedly hitting a slower system.
2. **Shared real-time state:** Maintain counters, rankings, limits, memberships and short-lived coordination state atomically across application instances.

## 2. When to Use Redis

Redis is a good fit when most of the following are true:

- The access pattern is known and primarily key-based.
- The application needs sub-millisecond server processing or low-single-digit-millisecond end-to-end latency.
- The active dataset fits in the available memory across the chosen shards.
- Data can be reconstructed, or the selected persistence configuration provides acceptable durability.
- Values are small and operations are bounded.
- The workload benefits from native data structures or TTL.
- Atomicity is required for one command or a small group of co-located keys.
- The application can tolerate asynchronous replication semantics during failover.

Common use cases:

- Cache database rows, API responses or computed objects.
- Store user sessions and authentication state.
- Enforce fixed-window, sliding-window or token-bucket rate limits.
- Maintain counters and quotas.
- Rank items using sorted sets.
- Track unique membership using sets, bitmaps or HyperLogLog.
- Store idempotency keys and deduplication windows.
- Track online presence and short-lived leases.
- Publish ephemeral notifications.
- Process compact real-time streams with consumer groups.

## 3. When Not to Use Redis

Avoid Redis as the main store when the workload mainly requires:

- Complex joins and relational constraints.
- Arbitrary filtering across many attributes.
- Large scans or ad-hoc analytics.
- Multi-record ACID transactions across independently sharded data.
- Very large blobs, media files or archival history.
- A dataset that is much larger than memory and is not a cacheable working set.
- Strongly durable acknowledgements with zero acceptable acknowledged-write loss.
- Unlimited stream retention or long-term event replay at Kafka-like scale.
- Search relevance, tokenization and fuzzy matching without a purpose-built search capability.

Bad reasons to choose Redis:

```text
"Redis is fast."
"Everything should be cached."
"It has persistence, so it is equivalent to PostgreSQL."
"It has Streams, so it is equivalent to Kafka."
```

Better reasoning:

```text
"The request path performs a key lookup at very high QPS, accepts bounded staleness,
and the working set fits in memory, so Redis is appropriate as a cache."
```

| Requirement | Better starting point |
|---|---|
| Relational transactions and joins | PostgreSQL |
| Durable, high-volume event history | Kafka, Cassandra or an object-store pipeline |
| Ad-hoc analytical aggregations | ClickHouse, BigQuery or another OLAP system |
| Full-text and relevance search | Elasticsearch/OpenSearch or Redis Search when its scope fits |
| Low-latency cache with TTL | Redis |
| Atomic counter, ranking or limit | Redis |
| Simple cache with minimal data structures | Redis or Memcached |

---

# Redis Mental Model

## 4. Key, Value, Database, Instance and Shard

- **Key:** A binary-safe identifier used to locate a value.
- **Value:** A Redis object such as a string, hash, list, set, sorted set or stream.
- **Logical database:** A numbered keyspace inside a non-clustered Redis instance. Logical databases are not an isolation or scaling boundary.
- **Instance:** One Redis server process with its own memory and persistence files.
- **Primary:** The writable node for a dataset or shard.
- **Replica:** A node that asynchronously follows a primary.
- **Shard:** A subset of the keyspace served by one primary and, normally, one or more replicas.
- **Cluster:** Multiple Redis nodes coordinating sharding and failover.
- **Client:** A driver that manages connections, routing, retries and serialization.

In Redis Cluster, database `0` is the practical keyspace model. Do not use numbered logical databases as a tenancy or sharding design.

## 5. In-Memory Serving Model

Redis serves the active dataset from memory. Optional persistence writes enough information to disk to reconstruct the dataset after restart.

This distinction matters:

```text
RAM  -> foreground request serving
Disk -> restart recovery and durability, depending on configuration
```

Redis does not normally perform a disk page lookup for each `GET`. That is a major reason it can provide low latency, but it also means capacity planning must start with memory rather than disk.

## 6. Command Execution and Atomicity

Redis processes a command against a shard without another command interleaving with that command's data-structure mutation. A command such as `INCR` is therefore atomic for concurrent clients.

The useful mental model is:

```text
many client connections
        |
        v
commands serialized at the target shard
        |
        v
atomic data-structure operations
```

Modern Redis can use additional threads for some networking, persistence and background work. The interview-relevant property is not the slogan "Redis is single-threaded"; it is that command execution on a shard is largely serialized and a slow command can delay unrelated commands on that shard.

Consequences:

- Simple bounded commands are fast and atomic.
- Long Lua scripts can block the shard.
- Large set operations can create latency spikes.
- One hot key cannot use the CPU of multiple primary shards.
- Horizontal throughput scaling requires distributing keys across shards.

![Redis command execution and atomicity](./diagrams/02-redis-command-execution.png)
<!-- GENERATED EXCALIDRAW: ./diagrams/02-redis-command-execution.excalidraw -->
<!--
ORIGINAL IMAGE NOTES
Title: Redis command execution and atomicity
What to use: Multiple application clients send commands through network I/O to one Redis shard. Show a short serialized command queue, atomic execution and a long-running command blocking commands behind it.
Preferred source: Create an original diagram based on the official Redis latency and programmability documentation.
Search terms: Redis command execution single threaded slow command latency Lua atomic
Purpose: Explain why atomic commands are simple but unbounded work harms tail latency.
Alt text: Redis serializes command execution on a shard, making individual commands atomic while allowing a slow command to delay other clients.
Editorial note: Avoid claiming that every part of modern Redis uses exactly one operating-system thread.
-->

## 7. Redis Is More Than a String Cache

Redis stores named data structures. The important design question is:

```text
Which data structure makes the required operation direct and atomic?
```

Examples:

| Requirement | Redis structure | Typical commands |
|---|---|---|
| Cache one object | String or JSON | `SET`, `GET` |
| Store object fields | Hash | `HSET`, `HGET`, `HINCRBY` |
| Queue or stack | List | `LPUSH`, `RPOP`, `BLPOP` |
| Unique membership | Set | `SADD`, `SISMEMBER`, `SINTER` |
| Ranking or time-ordered window | Sorted set | `ZADD`, `ZRANGE`, `ZRANGEBYSCORE` |
| Append-only events | Stream | `XADD`, `XREADGROUP`, `XACK` |
| Boolean flags at scale | Bitmap | `SETBIT`, `GETBIT`, `BITCOUNT` |
| Approximate unique count | HyperLogLog | `PFADD`, `PFCOUNT` |
| Geospatial proximity | Geospatial index | `GEOADD`, `GEOSEARCH` |

Redis documents the core and optional structures in its [data-types reference](https://redis.io/docs/latest/develop/data-types/).

---

# Data Structures

## 8. Strings

A Redis string stores bytes. It can contain text, a serialized object, an integer, binary data or a bitmap.

```redis
SET product:42 '{"name":"Keyboard","price":4999}' EX 300
GET product:42
```

Common uses:

- Cached objects.
- Counters.
- Feature flags.
- Idempotency records.
- Distributed lock tokens.
- Compact binary values.

Atomic counter:

```redis
INCR article:42:views
INCRBY quota:user:17 10
```

Use a string when the application usually reads or replaces the complete value. If individual fields change frequently, a hash or JSON value may avoid unnecessary serialization and transfer.

## 9. Hashes

A hash stores field-value pairs under one Redis key.

```redis
HSET user:17 name "Asha" plan "pro" loginCount 12
HGET user:17 plan
HINCRBY user:17 loginCount 1
```

Good uses:

- Small object-like records.
- Related counters.
- Frequently updated fields.

Trade-offs:

- The entire hash belongs to one shard.
- A very large hash becomes a big key.
- The access pattern is still key plus field; it is not arbitrary relational querying.
- Field-level expiration depends on the Redis version and commands available in the deployment; key-level TTL remains the most portable design.

## 10. Lists

A list is an ordered sequence optimized for work near its ends.

```redis
LPUSH jobs:email job-123
BRPOP jobs:email 5
LTRIM feed:user:17 0 999
```

Good uses:

- Simple queue.
- Stack.
- Bounded recent-items list.

Limitations:

- Random access or deletion in a long list can be expensive.
- A consumer that removes a job and crashes can lose it unless a reliable-queue pattern is used.
- There is no Kafka-style partitioned replay model.
- One long list is one key and therefore one shard.

Use Redis Streams when the system needs consumer groups, acknowledgements, pending entries or replay.

## 11. Sets

A set stores unique unordered members.

```redis
SADD post:42:likers user-1 user-2
SISMEMBER post:42:likers user-1
SCARD post:42:likers
```

Good uses:

- Exact membership.
- Deduplication.
- Tags and permissions.
- Mutual-friend or common-interest operations on bounded sets.

Set operations such as intersection and union are convenient, but their cost depends on input cardinality. Do not run large cross-set operations on the latency-critical shard without measuring them.

## 12. Sorted Sets

A sorted set stores unique members ordered by numeric score.

```redis
ZADD leaderboard:global 9820 user-17
ZINCRBY leaderboard:global 25 user-17
ZREVRANGE leaderboard:global 0 9 WITHSCORES
ZREVRANK leaderboard:global user-17
```

Good uses:

- Leaderboards.
- Priority queues.
- Time-indexed windows.
- Delayed-job schedules.
- Sliding-window rate limiting.

The score supplies order, while the member supplies uniqueness. If the same member is added again, its score is updated rather than a duplicate member being created.

## 13. Streams

A Redis Stream is an append-only sequence of field-value entries with ordered IDs.

```redis
XADD orders MAXLEN ~ 100000 * orderId 123 status created
XGROUP CREATE orders fulfillment 0 MKSTREAM
XREADGROUP GROUP fulfillment worker-1 COUNT 10 BLOCK 5000 STREAMS orders >
XACK orders fulfillment 1710000000000-0
```

Consumer groups track:

- The group's last-delivered position.
- Which consumer received an entry.
- Pending entries that were delivered but not acknowledged.

Streams can support at-least-once processing when consumers acknowledge only after success and reclaim abandoned pending entries. Consumers must still be idempotent because redelivery can produce duplicates.

See the official [Redis Streams documentation](https://redis.io/docs/latest/develop/data-types/streams/) for entry IDs, consumer groups and pending-entry behavior.

Use Streams for:

- Compact operational event pipelines.
- Per-user notification history.
- Short-retention work queues.
- Real-time fan-out with replay.

Prefer Kafka when the design requires very large durable logs, long retention, extensive replay, many independent consumer groups or storage beyond Redis memory economics.

## 14. Bitmaps and Bitfields

Redis implements bitmap operations over string values.

```redis
SETBIT active:2026-07-13 1048576 1
GETBIT active:2026-07-13 1048576
BITCOUNT active:2026-07-13
```

If user IDs can map to dense numeric offsets, one bit per user is far smaller than one set member per user.

Good uses:

- Daily active-user flags.
- Feature eligibility flags.
- Attendance or completion tracking.

Poor fit:

- Sparse unbounded IDs, because a high offset expands the string.
- Storing associated metadata.

## 15. HyperLogLog

HyperLogLog estimates the number of unique elements using fixed, small memory rather than storing every member.

```redis
PFADD unique:visitors:2026-07-13 user-1 user-2
PFCOUNT unique:visitors:2026-07-13
```

Use it when:

- Only approximate cardinality is required.
- The exact members do not need to be returned.
- A small error is acceptable.

Do not use HyperLogLog for exact billing, exact compliance counts or membership checks.

## 16. Geospatial Data

Redis geospatial commands index longitude and latitude and support radius or bounding-box searches.

```redis
GEOADD drivers:bangalore 77.5946 12.9716 driver-17
GEOSEARCH drivers:bangalore FROMLONLAT 77.60 12.97 BYRADIUS 5 km
```

Good uses:

- Nearby drivers, stores or devices.
- A rapidly changing proximity index.

The key design still matters. A single global geospatial key can become large and hot. Partition by region or another stable spatial boundary when needed, and query adjacent regions at boundaries.

## 17. JSON, Search and Probabilistic Structures

Modern Redis distributions can expose JSON documents, secondary search, vectors and probabilistic structures such as Bloom filters, count-min sketch, t-digest and Top-K.

Interview guidance:

- State whether the feature is available in the proposed Redis distribution and version.
- Include index memory in capacity planning.
- Do not silently assume an extension exists in every Redis deployment.
- Compare a Redis-integrated search workload with a dedicated search system before choosing it for large search-heavy designs.

![Redis data-structure selection map](./diagrams/03-redis-data-structure-selection.png)
<!-- GENERATED EXCALIDRAW: ./diagrams/03-redis-data-structure-selection.excalidraw -->
<!--
ORIGINAL IMAGE NOTES
Title: Redis data-structure selection map
What to use: A decision tree starting from the required operation: one value, object fields, sequence, exact membership, ranked order, event log, bits, approximate unique count or geo search. Map each branch to the relevant Redis structure and two representative commands.
Preferred source: Create an original diagram based on the official Redis data-types documentation.
Search terms: Redis data types strings hashes lists sets sorted sets streams HyperLogLog bitmap geo
Purpose: Help interview candidates select Redis because of an operation rather than generic speed.
Alt text: Redis structure selection based on whether the workload needs values, fields, sequences, membership, ranking, streams, bits, approximate counts or geospatial lookup.
Editorial note: Keep optional version-specific types visually separate from the core types.
-->

---

# Key and Access-Pattern Design

## 18. Model Keys Around Access Patterns

Redis is strongest when a request can derive the complete key directly.

```text
entity-type:entity-id:purpose
```

Examples:

```text
user:17:profile
session:6f8c...
product:42:details
rate:user-17:login:2026-07-13T20:05
leaderboard:weekly:2026-W29
```

For every requirement, define:

1. The exact key.
2. The data type.
3. The commands.
4. The TTL or retention rule.
5. The maximum value cardinality or size.
6. The sharding behavior.
7. The source of truth and recovery path.

## 19. Key Naming

Good key names are:

- Deterministic.
- Compact enough to avoid unnecessary memory.
- Structured enough for debugging.
- Stable across deployments.
- Explicit about tenant or scope where required.

Example:

```text
tenant:{tenant-42}:cart:user-17
```

The braces are not decorative in Redis Cluster. They define the hash tag used to place related keys in the same slot.

Do not place secrets or sensitive raw personal data in key names. Keys appear in diagnostics, memory analysis and operational tooling.

## 20. Point Lookups, Not Arbitrary Filters

Efficient:

```redis
GET user:17:profile
HGET cart:17 item-42
ZRANGEBYSCORE events:user-17 1710000000 1710003600
```

Poor primary access pattern:

```text
Find every user where country = India and age > 35
```

Core Redis does not automatically maintain relational secondary indexes for arbitrary fields. The application must create explicit access paths, use a search/indexing capability or choose another database.

> **Interview rule:** If the key cannot be derived from the request, explain which index supplies it. Never assume Redis scans are free because the dataset is in memory.

## 21. Avoid `KEYS` on Production Request Paths

`KEYS pattern` examines the keyspace and can block the shard while it works.

Prefer:

- Direct key derivation.
- An explicit set or sorted set containing relevant IDs.
- `SCAN` for incremental administrative iteration.

`SCAN` reduces per-call blocking but is not a strongly consistent snapshot. During concurrent changes it can return duplicates and may not provide a simple exact view. The caller must handle cursors and deduplicate when necessary.

## 22. Big Keys

A big key is a key whose value contains a large string or a large number of collection members.

Problems:

- One command can consume substantial CPU.
- Deletion can create latency unless asynchronous deletion is used appropriately.
- Replication and persistence must copy large payloads.
- Cluster migration moves the entire key as one unit.
- One key cannot be split automatically across shards.

Examples:

```text
one hash containing 20 million users
one list containing every event ever produced
one 100 MB serialized object
one global set of all active sessions
```

Better:

```text
active-sessions:{region}:{bucket}
feed:{userId}:{page}
events:{tenantId}:{hour}
```

Choose a bound and retention rule before launch.

## 23. Hot Keys

A hot key receives far more traffic than other keys. Because one key belongs to one shard, adding shards does not divide one key's work.

Mitigations depend on the operation:

- Add a local in-process cache for read-heavy immutable data.
- Use client-side caching with invalidation when appropriate.
- Replicate or precompute a popular read value.
- Shard a write-heavy counter into `N` partial counters and aggregate on read.
- Batch or coalesce updates.
- Remove unnecessary polling.

Trade-off for sharded counters:

```text
write -> one of N counter keys
read  -> fetch and sum N keys
```

Use the smallest `N` that removes the bottleneck. More shards increase read cost and coordination.

## 24. Multi-Key Operations in Redis Cluster

Redis Cluster divides the keyspace into 16,384 hash slots. A multi-key command, transaction or Lua script generally requires all referenced keys to be in the same slot.

This fails when keys map to different slots:

```redis
MSET user:1 Alice user:2 Bob
```

Typical error:

```text
CROSSSLOT Keys in request don't hash to the same slot
```

Use a hash tag to co-locate related keys:

```redis
MSET {order:123}:status created {order:123}:amount 4999
```

Both keys hash the substring `order:123`.

Trade-off:

- Co-location enables atomic multi-key work.
- Excessive reuse of one hash tag concentrates traffic and creates a hot shard.

> **Interview rule:** Design the atomicity boundary and the sharding boundary together.

The official [multi-key operations reference](https://redis.io/docs/latest/develop/using-commands/multi-key-operations/) documents same-slot behavior and common `CROSSSLOT`, `MOVED` and `TRYAGAIN` errors.

---

# Atomicity, Transactions and Coordination

## 25. Prefer Atomic Commands

Bad read-modify-write:

```text
value = GET counter
value = value + 1
SET counter value
```

Two clients can read the same value and overwrite each other's increments.

Correct:

```redis
INCR counter
```

Other useful atomic primitives:

```redis
SET key value NX EX 30
HINCRBY user:17 credits -1
SADD processed:event-123 consumer-a
ZADD leaderboard GT 100 user-17
```

Choose the most specific atomic command before reaching for a transaction or script.

## 26. `MULTI` and `EXEC`

Redis transactions queue commands and execute them sequentially when `EXEC` runs.

```redis
MULTI
INCR account:17:requests
EXPIRE account:17:requests 60
EXEC
```

Important semantics:

- Other clients do not interleave commands inside the executed transaction.
- Commands are queued before execution.
- Redis does not provide relational-style rollback for runtime command errors.
- A transaction without `WATCH` does not protect a prior client-side read.
- In Redis Cluster, the keys must respect the same-slot requirement.

## 27. Optimistic Concurrency with `WATCH`

`WATCH` makes `EXEC` conditional on watched keys remaining unchanged.

```redis
WATCH inventory:sku-42
GET inventory:sku-42
MULTI
DECR inventory:sku-42
EXEC
```

If another client changes the watched key before `EXEC`, the transaction aborts and the application retries.

Use when:

- Contention is expected to be low.
- The application needs conditional read-modify-write logic.

Avoid unbounded retries under high contention. A server-side script or a different data model can be better.

## 28. Lua Scripts and Redis Functions

A Lua script can combine reads, conditions and writes atomically at the server.

Example requirement:

```text
Increment a counter and set its TTL only when the key is first created.
```

```lua
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return current
```

Benefits:

- One client-to-server round trip.
- Atomic conditional logic.
- Logic executes where the data lives.

Risks:

- Scripts block other command execution on the shard while running.
- Unbounded loops or large collection scans create latency spikes.
- Scripts must declare and use keys correctly for cluster routing.
- Application deployment must handle script or function lifecycle.

Keep scripts short, deterministic and bounded.

Redis guarantees atomic script execution and warns that server activity is blocked while the script runs; see [scripting with Lua](https://redis.io/docs/latest/develop/programmability/eval-intro/).

## 29. Distributed Locks

A basic single-Redis lease can be acquired with:

```redis
SET lock:order-123 8f92c1... NX PX 30000
```

Requirements:

- Use a unique random token for each acquisition.
- Set a finite lease time.
- Release only if the stored token still matches.
- Use an atomic compare-and-delete script for release.

Conceptual release script:

```lua
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0
```

The lease prevents permanent lock retention, but it introduces another problem: the owner may pause longer than the lease, resume after expiration and still perform a stale write.

For high-stakes external side effects, use **fencing tokens**:

```text
lock service issues token 41, then 42, then 43
storage system rejects any write with a token lower than the latest accepted token
```

Do not use a Redis lock as a substitute for a database uniqueness constraint or transactional state transition when the database can enforce the invariant directly.

![Redis atomic operations and coordination](./diagrams/04-redis-atomicity-options.png)
<!-- GENERATED EXCALIDRAW: ./diagrams/04-redis-atomicity-options.excalidraw -->
<!--
ORIGINAL IMAGE NOTES
Title: Redis atomicity options
What to use: A ladder from one atomic command, to MULTI/EXEC, to WATCH retries, to Lua/Functions, to a lease with fencing for external resources. Show the cluster same-slot boundary across multi-key options.
Preferred source: Create an original diagram based on Redis transaction, scripting and Cluster documentation.
Search terms: Redis atomic commands MULTI EXEC WATCH Lua same slot distributed lock fencing
Purpose: Show the simplest correct primitive for each concurrency requirement.
Alt text: Redis offers atomic commands, transactions, optimistic concurrency, scripts and leases, with multi-key work constrained by cluster slot placement.
Editorial note: Do not imply that MULTI/EXEC rolls back like a relational transaction.
-->

---

# Expiration, Eviction and Caching

## 30. Expiration with TTL

TTL defines when a key should stop being visible.

```redis
SET session:abc payload EX 1800
EXPIRE cart:user-17 86400
PTTL session:abc
```

Redis removes expired keys through two mechanisms:

1. **Passive expiration:** An accessed key is found to be expired and removed.
2. **Active expiration:** Redis periodically samples keys with TTLs and removes expired ones.

Therefore, a key is logically expired when its TTL reaches zero, but physical deletion and expiration notifications do not necessarily occur at the exact theoretical millisecond.

The [official `EXPIRE` reference](https://redis.io/docs/latest/commands/expire/) describes passive and active expiration.

Use TTL for:

- Sessions.
- Rate-limit windows.
- Cache entries.
- Idempotency windows.
- Temporary tokens.
- Presence leases.

## 31. Expiration Is Not Eviction

- **Expiration:** The application assigns a lifetime to a key.
- **Eviction:** Redis removes keys because memory exceeds `maxmemory`.

A key can expire even when memory is plentiful. A key can be evicted before its TTL ends when the configured policy allows it.

This distinction is important when Redis stores primary data. An eviction policy that is safe for a cache may be data loss for a primary store.

## 32. `maxmemory` and Memory Boundaries

Configure `maxmemory` so Redis does not consume all host memory.

Memory outside the logical dataset may include:

- Replication buffers.
- AOF buffers.
- Client output buffers.
- Allocator fragmentation.
- Fork copy-on-write overhead during snapshots or rewrites.
- Module or index memory.
- Operating-system memory.

Do not size `maxmemory` equal to host RAM.

## 33. Eviction Policies

Common policy families:

| Policy | Candidate keys | Selection idea | Typical use |
|---|---|---|---|
| `noeviction` | None | Reject writes that require more memory | Primary data or strict capacity control |
| `allkeys-lru` | All keys | Approximate least recently used | General cache |
| `allkeys-lfu` | All keys | Approximate least frequently used | Skewed popularity cache |
| `allkeys-random` | All keys | Random | Specialized/simple cache |
| `volatile-lru` | Keys with TTL | Approximate LRU | Mixed persistent and expiring keyspace |
| `volatile-lfu` | Keys with TTL | Approximate LFU | Mixed keyspace with popularity skew |
| `volatile-ttl` | Keys with TTL | Prefer shorter remaining TTL | Expiry-oriented cache |
| `volatile-random` | Keys with TTL | Random volatile key | Specialized use |

Guidance:

- Use an `allkeys-*` policy for a dedicated cache where any entry can be rebuilt.
- Use `noeviction` when unexpected deletion is unacceptable.
- Avoid mixing critical non-expiring data and disposable cache data in one eviction domain.

When `noeviction` reaches the memory limit, commands that add data fail rather than silently evicting a key. The application must handle the error.

See [Redis key eviction](https://redis.io/docs/latest/develop/reference/eviction/) for `maxmemory`, policy behavior and memory-buffer considerations.

## 34. Cache-Aside Pattern

Read path:

```text
1. Read Redis.
2. On hit, return cached value.
3. On miss, read the database.
4. Populate Redis with a TTL.
5. Return the value.
```

Write path:

```text
1. Commit the database transaction.
2. Delete or invalidate the cache key.
```

Deleting after the database commit is usually easier to reason about than updating two independent systems with an assumed atomic dual write.

```pseudo
function getProduct(id):
    key = "product:" + id
    cached = redis.get(key)
    if cached exists:
        return cached

    product = database.getProduct(id)
    redis.set(key, serialize(product), ttl = 5 minutes)
    return product
```

![Cache-aside read and invalidation flow](./diagrams/05-cache-aside-flow.png)
<!-- GENERATED EXCALIDRAW: ./diagrams/05-cache-aside-flow.excalidraw -->
<!--
ORIGINAL IMAGE NOTES
Title: Cache-aside read and invalidation flow
What to use: Separate read and write lanes. Read lane shows hit versus miss, database fetch and cache population. Write lane shows database commit followed by cache deletion. Include a small stale-read race note.
Preferred source: Create an original diagram; no third-party image is necessary.
Search terms: Redis cache aside pattern cache invalidation database
Purpose: Show the most common Redis placement in an HLD request path.
Alt text: Cache-aside reads check Redis first and populate it after a database miss, while writes commit the database and then invalidate the cache.
Editorial note: Do not imply that the database write and cache invalidation form one atomic transaction.
-->

## 35. Cache Consistency

Redis and the primary database are independent systems. A cache can be stale when:

- The database changed and invalidation has not arrived.
- A cache deletion failed.
- A delayed cache fill writes an older value after a newer update.
- A replica read lags behind the Redis primary.
- TTL has not yet expired.

State an explicit staleness budget:

```text
Product description: up to 5 minutes may be acceptable.
Account balance: stale cache is usually unacceptable.
Authorization change: seconds may still be unsafe.
```

Mitigations:

- Short TTL.
- Versioned cache values.
- Database change-data-capture invalidation.
- Write-through logic when justified.
- Bypass cache for correctness-critical reads.
- Include a source version and reject older cache fills.

## 36. Cache Stampede

A stampede occurs when many requests miss the same popular key and all query the database.

Example:

```text
10,000 requests arrive just after one hot key expires
-> 10,000 database queries
```

Mitigations:

- Per-key single-flight request coalescing.
- A short lock so one request rebuilds the entry.
- Stale-while-revalidate.
- Proactive refresh before expiry.
- Random TTL jitter so many keys do not expire together.

TTL jitter:

```text
base TTL = 300 seconds
actual TTL = 300 + random(0, 60)
```

## 37. Cache Penetration

Cache penetration occurs when requests repeatedly ask for data that does not exist, causing every request to reach the database.

Mitigations:

- Negative-cache "not found" for a short TTL.
- Validate impossible IDs before lookup.
- Use a Bloom filter for very large membership tests when false positives are acceptable.
- Rate-limit abusive clients.

Do not negative-cache transient backend failures as if the record does not exist.

## 38. Cache Avalanche

A cache avalanche occurs when a large portion of the cache becomes unavailable or expires together.

Mitigations:

- Spread TTLs with jitter.
- Warm critical keys gradually.
- Use high availability across failure domains.
- Apply backend load shedding and circuit breaking.
- Preserve stale values for controlled fallback when the product permits it.

![Redis expiration and eviction](./diagrams/06-expiration-vs-eviction.png)
<!-- GENERATED EXCALIDRAW: ./diagrams/06-expiration-vs-eviction.excalidraw -->
<!--
ORIGINAL IMAGE NOTES
Title: Redis expiration versus eviction
What to use: Two timelines. TTL lane shows logical expiry followed by passive or active deletion. Memory-pressure lane shows maxmemory crossing a threshold and policy-driven eviction. Include noeviction returning a write error.
Preferred source: Create an original diagram based on official Redis EXPIRE and eviction documentation.
Search terms: Redis expiration active passive eviction maxmemory LRU LFU noeviction
Purpose: Prevent candidates from treating TTL and eviction as the same mechanism.
Alt text: Redis expires keys according to TTL and separately evicts keys under memory pressure according to maxmemory policy.
Editorial note: Show eviction policies as approximate rather than exact global LRU/LFU.
-->

---

# Persistence and Durability

## 39. Persistence Options

Redis provides four broad choices:

1. No persistence.
2. RDB snapshots.
3. AOF logging.
4. RDB and AOF together.

These modes and their trade-offs are defined in the official [Redis persistence guide](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/).

The correct choice depends on whether Redis is:

- A disposable cache.
- Reconstructable derived state.
- A primary store with an explicit recovery-point objective.

## 40. RDB Snapshots

RDB creates point-in-time snapshots of the dataset.

Advantages:

- Compact backup artifact.
- Fast restarts for large datasets.
- Good for periodic backups and disaster recovery.
- Lower steady-state write overhead than logging every command.

Trade-offs:

- Data written after the last completed snapshot can be lost.
- Snapshot creation uses background processes and can create copy-on-write memory pressure.
- Fork and disk I/O can affect latency on large, write-heavy datasets.

Example reasoning:

```text
snapshot every 5 minutes
-> recovery can lose up to roughly 5 minutes of recent data in the worst timing case
```

The exact loss window depends on configuration and failure timing.

## 41. Append-Only File

AOF records write operations so Redis can replay them during recovery.

Common fsync choices:

| Policy | Durability | Performance implication |
|---|---|---|
| Every write | Strongest local-disk acknowledgement | Highest latency and lowest throughput |
| Every second | Common balance | Roughly one second of recent writes may be lost on host failure |
| OS-managed/no forced fsync | Weakest timing control | Highest performance, larger uncertain loss window |

AOF files are periodically rewritten to compact historical commands into a smaller representation of the current dataset.

## 42. RDB and AOF Together

Using both can combine:

- RDB's compact snapshots and backup convenience.
- AOF's smaller recovery-point window.

It also combines operational costs:

- More disk usage.
- Background snapshot and rewrite work.
- Additional I/O and copy-on-write memory requirements.

Persistence should be load-tested with the real write rate and value sizes, not enabled as a checkbox after capacity sizing.

## 43. Persistence Does Not Equal High Availability

- **Persistence** recovers data after restart.
- **Replication** maintains another online copy.
- **Sentinel or Cluster failover** promotes a replica.
- **Backups** protect against logical deletion and correlated failure.

These are separate controls.

```text
persistence without replication -> durable but can be unavailable during node failure
replication without persistence -> available copy but correlated restart can lose the dataset
replication and persistence without backup -> accidental deletion can replicate everywhere
```

## 44. Decide the Recovery Objectives

State:

- **RPO:** How much recent data can be lost?
- **RTO:** How long can the service remain unavailable?

Examples:

| Workload | Example RPO | Example RTO | Possible design |
|---|---:|---:|---|
| Disposable cache | Complete cache loss acceptable | Seconds to minutes | Replication optional; rebuild from source |
| Session store | Seconds may log out users | Seconds | Replica, automatic failover, AOF depending on requirement |
| Rate-limit state | A short loss weakens enforcement | Seconds | Replica; conservative fallback during outage |
| Primary financial record | Near-zero loss | Very low | Redis is usually not the sole system of record |

![Redis persistence paths](./diagrams/07-redis-persistence.png)
<!-- GENERATED EXCALIDRAW: ./diagrams/07-redis-persistence.excalidraw -->
<!--
ORIGINAL IMAGE NOTES
Title: Redis persistence paths
What to use: Redis RAM in the center. RDB branch shows periodic point-in-time snapshot. AOF branch shows each write appended and fsync choices. Restart merges into a recovery path. Include separate labels for replication and backup outside the persistence box.
Preferred source: Create an original diagram based on official Redis persistence documentation.
Search terms: Redis persistence RDB AOF fsync everysec rewrite recovery
Purpose: Explain durability choices and distinguish them from replication.
Alt text: Redis can recover from periodic RDB snapshots, an append-only log, or both, while replication and backups solve separate problems.
Editorial note: Do not promise zero data loss for AOF every second.
-->

---

# Replication, Sentinel and Cluster

## 45. Primary-Replica Replication

Redis replication is normally asynchronous:

```text
client -> primary applies write -> primary acknowledges client
                              -> primary sends write to replica
```

Benefits:

- An online copy for failover.
- Optional read scaling for workloads that accept replica staleness.
- Faster recovery than rebuilding everything from the source system.

Trade-offs:

- A replica can lag.
- An acknowledged write can be missing from the promoted replica if the primary fails at the wrong time.
- Reading from replicas can violate read-your-writes.

## 46. Redis Sentinel

Sentinel provides high availability for a non-sharded primary-replica deployment.

Sentinel responsibilities:

- Monitor primary and replicas.
- Detect failures through agreement among Sentinel processes.
- Elect a Sentinel leader for failover.
- Promote a replica.
- Reconfigure remaining replicas.
- Tell compatible clients where the current primary is.

Sentinel does **not** shard the dataset.

Production guidance:

- Run multiple independent Sentinel processes across failure domains.
- Use Sentinel-aware clients.
- Configure timeouts and quorum deliberately.
- Expect a brief failover interval and possible acknowledged-write loss from asynchronous replication.

The [Redis Sentinel documentation](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/) describes monitoring, failure agreement, failover authorization and client discovery.

## 47. Redis Cluster

Redis Cluster adds horizontal sharding and per-shard failover.

Core model:

- The keyspace is divided into 16,384 hash slots.
- Each primary owns a subset of slots.
- Each primary normally has one or more replicas.
- Cluster-aware clients route a key to the node owning its slot.
- Slots can move during resharding.

Example with three primary shards:

```text
Primary A: slots 0-5460
Primary B: slots 5461-10922
Primary C: slots 10923-16383
```

Do not call this consistent hashing. Redis Cluster uses fixed hash slots based on CRC16 and slot ownership.

The official [Redis Cluster scaling guide](https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/) specifies the 16,384-slot model, master-replica failover and consistency limitations.

## 48. Request Routing

A cluster-aware client can:

1. Compute the key's slot.
2. Route the command to the believed owner.
3. Refresh its topology when it receives a redirection.

Important responses:

- `MOVED`: The slot belongs to another node; update routing.
- `ASK`: During migration, send this command to a temporary destination as instructed.
- `CROSSSLOT`: The command references keys from different slots.
- `TRYAGAIN`: A transient cluster state prevents the operation.

Clients need bounded retry logic. A timeout does not always prove that the command was not applied.

## 49. Cluster Failover and Consistency

Redis Cluster does not guarantee strong consistency. An acknowledged write can be lost when:

1. The primary applies and acknowledges the write.
2. The write has not reached a replica.
3. The primary fails.
4. A replica without the write is promoted.

During a network partition, a primary isolated with a minority may briefly accept writes. After the configured node-timeout conditions are met, the minority-side primary stops accepting writes, but writes accepted before that can be lost when the majority-side replica becomes authoritative.

## 50. `WAIT` and Replication Acknowledgements

`WAIT` can ask Redis to wait until a specified number of replicas acknowledge prior writes from the client.

Conceptually:

```redis
SET order:123:status paid
WAIT 1 100
```

This reduces the probability of losing the write, but it does not convert Redis Cluster into a fully strongly consistent consensus database. Complex failure and promotion scenarios can still lose acknowledged writes.

Use it selectively when the lower loss probability justifies extra latency.

This limitation is explicit in the [Redis Cluster consistency documentation](https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/#redis-cluster-consistency-guarantees).

## 51. Reading from Replicas

Replica reads can increase aggregate read capacity, but introduce:

- Replication lag.
- Stale reads.
- Broken read-your-writes after a primary write.
- Application routing complexity.

Prefer primary reads for correctness-sensitive state. Use replica reads for explicitly stale-tolerant workloads such as cached catalog data or analytics-like counters.

## 52. Multi-Region Redis

Open-source Redis replication is primary-replica and asynchronous. A simple cross-region replica can support disaster recovery, but cross-region promotion introduces possible data loss and client-routing work.

Commercial Active-Active Redis products use additional conflict-resolution mechanisms. Do not present those semantics as generic Redis Open Source behavior.

For a multi-region interview design, state:

- One write region or multiple write regions.
- Replication lag and RPO.
- Client failover mechanism.
- Conflict-resolution rules.
- Whether a regional primary database remains the source of truth.

![Redis Sentinel failover](./diagrams/08-redis-sentinel-failover.png)
<!-- GENERATED EXCALIDRAW: ./diagrams/08-redis-sentinel-failover.excalidraw -->
<!--
ORIGINAL IMAGE NOTES
Title: Redis Sentinel failover
What to use: Three Sentinel processes monitor one primary and two replicas across three availability zones. Show objective-down agreement, leader authorization, replica promotion and clients discovering the new primary.
Preferred source: Create an original diagram based on official Redis Sentinel documentation.
Search terms: Redis Sentinel quorum ODOWN failover replica promotion architecture
Purpose: Explain that multiple Sentinels coordinate failover for a non-sharded deployment.
Alt text: Multiple Sentinels agree that a Redis primary is down, authorize failover, promote a replica and direct clients to the new primary.
Editorial note: Keep Sentinel processes distinct from Redis data nodes.
-->

![Redis Cluster hash slots and failover](./diagrams/09-redis-cluster-hash-slots.png)
<!-- GENERATED EXCALIDRAW: ./diagrams/09-redis-cluster-hash-slots.excalidraw -->
<!--
ORIGINAL IMAGE NOTES
Title: Redis Cluster hash slots and failover
What to use: Three primary shards with non-overlapping portions of 16,384 slots and one replica per primary. Show a client computing CRC16(key) mod 16384, routing to a primary, and one replica promotion. Include related keys with a shared hash tag.
Preferred source: Create an original diagram based on official Redis Cluster scaling and specification pages.
Search terms: Redis Cluster 16384 hash slots CRC16 replicas MOVED hash tags
Purpose: Explain sharding, routing, same-slot multi-key work and per-shard failover.
Alt text: Redis Cluster maps keys to 16,384 hash slots owned by primary shards, each protected by replicas that can be promoted.
Editorial note: Do not draw a consistent-hashing ring.
-->

---

# Performance Model

## 53. What Makes Redis Fast

Redis performance comes from a combination of:

- In-memory data access.
- Direct key lookup.
- Efficient specialized data structures.
- A compact protocol.
- Atomic operations without cross-thread locking inside a shard's command path.
- Pipelining and batching to reduce network round trips.

The network often dominates a simple command's server processing time. A fast Redis server in another region is still a slow dependency.

## 54. Time Complexity Matters

Do not assume every Redis command is `O(1)`.

Examples:

| Operation | Typical complexity idea |
|---|---|
| `GET`, `SET`, `INCR` | Constant-time with respect to collection size |
| `HGET`, `SADD`, `SISMEMBER` | Usually constant-time average behavior |
| `ZADD` | Logarithmic in sorted-set size |
| `ZRANGE` | Logarithmic lookup plus returned elements |
| `LRANGE` | Depends on traversal and returned range |
| `SMEMBERS` | Linear in set cardinality and response size |
| `KEYS` | Linear in key count |
| Lua script | Depends on every command and loop inside it |

Always include result size. Returning one million members is expensive even when locating the collection is cheap.

## 55. Pipelining

Without pipelining:

```text
send command -> wait one RTT -> send next command -> wait one RTT
```

With pipelining:

```text
send many commands -> receive many replies
```

Pipelining improves throughput by amortizing round-trip and protocol overhead. It does not make the group atomic.

Use bounded pipeline sizes. Very large pipelines consume client and server buffer memory and can delay individual responses.

See [Redis pipelining](https://redis.io/docs/latest/develop/using-commands/pipelining/) for the round-trip model.

## 56. Batching Versus Atomicity

| Mechanism | Reduces RTT | Atomic group | Conditional logic |
|---|---:|---:|---:|
| Pipeline | Yes | No | No |
| Multi-key command | Yes | One command | Command-specific |
| `MULTI/EXEC` | Yes | Commands execute without interleaving | With `WATCH` for optimistic checks |
| Lua/Function | Yes | Yes while script runs | Yes |

Choose based on correctness first, then round-trip optimization.

## 57. Latency Hazards

Common causes of Redis tail-latency spikes:

- Big-key operations.
- `KEYS` or large collection scans.
- Long Lua scripts.
- Large replies.
- Fork and copy-on-write pressure.
- AOF fsync or rewrite I/O.
- Swap activity.
- CPU saturation on a hot shard.
- Network congestion.
- Client connection storms.
- Replica synchronization.

Avoid swap for the Redis working set. A memory page fault to disk defeats the latency model.

## 58. Interview Latency and Throughput Assumptions

Redis performance depends on hardware, command mix, payload size, pipeline depth, persistence and topology. Do not present one universal benchmark.

Reasonable **interview planning assumptions** for simple operations with small values in the same region are:

```text
end-to-end p99 target: approximately 1-5 ms
starting throughput assumption: approximately 50k-100k simple operations/s per primary shard
```

These are sizing placeholders, not product guarantees. State that the final design requires `memtier_benchmark` or an application-representative load test.

Reduce the estimate for:

- Large values.
- Expensive collection commands.
- Heavy Lua.
- Stronger persistence.
- Cross-zone or cross-region traffic.
- TLS and connection churn.

## 59. Connection Management

Use persistent connection pools or multiplexed clients rather than creating a TCP/TLS connection per operation.

Monitor:

- Connected clients.
- Rejected connections.
- Client output-buffer growth.
- Connection establishment rate.
- Timeout and retry rate.

An unbounded client pool can overload Redis even when command QPS is moderate.

---

# Memory and Capacity Planning

## 60. Capacity Inputs

Estimate:

```text
number of keys
average and p99 key length
average and p99 value size
data-structure cardinality
object and allocator overhead
TTL distribution
peak read and write QPS
command mix
replica count
persistence mode
replication and client buffers
fragmentation
fork copy-on-write headroom
target memory utilization
throughput per shard from benchmarks
failure headroom
```

## 61. Dataset Memory Formula

```text
logical dataset memory
= number of keys
 × (average key bytes + average value bytes + per-key/data-structure overhead)
```

Redis object overhead varies by data type, encoding, allocator and version. Measure representative keys with `MEMORY USAGE`; do not assume payload bytes equal memory bytes.

## 62. Working Memory Formula

```text
required primary memory
= logical dataset memory
 / target dataset utilization
```

The utilization reserve covers fragmentation, buffers and workload spikes. For an interview, a conservative starting target can be 60-70%, followed by measurement.

With one replica per primary:

```text
cluster RAM across data nodes
≈ required primary memory × 2
```

This excludes Sentinel processes and additional disaster-recovery copies.

## 63. Example Memory Calculation

Assume:

```text
100 million active sessions
average key              = 100 bytes
average serialized value = 1,000 bytes
estimated overhead       = 150 bytes
target utilization       = 65%
one replica per primary
```

Logical dataset:

```text
100M × (100 + 1,000 + 150) bytes
= 125 GB
```

Primary capacity with headroom:

```text
125 GB / 0.65
≈ 192 GB
```

With one replica:

```text
192 GB × 2
≈ 384 GB total RAM across primary and replica nodes
```

If each primary is designed for about 64 GB of usable allocation:

```text
primary shards ≈ ceil(192 / 64) = 3
data nodes with one replica each = 6
```

Validate that three shards also satisfy throughput and failover requirements.

## 64. Throughput Formula

```text
primary shards required for throughput
= peak operations per second
 / measured safe operations per second per shard
```

Example:

```text
peak = 240k operations/s
safe measured shard capacity = 60k operations/s

shards = ceil(240k / 60k) = 4
```

Add failure headroom. If the system must survive one primary shard's workload moving to a replica without saturation, normal utilization must remain below failover capacity.

## 65. Network Formula

```text
network throughput
≈ QPS × (request bytes + response bytes)
```

Example:

```text
200k GET/s × 1.2 KB average request+response
≈ 240 MB/s
≈ 1.92 Gbit/s before protocol, TLS and replication overhead
```

Add:

- Replica traffic.
- Cluster redirections and migrations.
- Persistence transfer or backup traffic.
- Peak multiplier.

## 66. Node Count Is the Maximum Constraint

```text
required primary shards
= max(
    shards for memory,
    shards for CPU/throughput,
    shards for network,
    shards for hot-key isolation
  )
```

Then add replicas and failure-domain placement.

![Redis capacity planning](./diagrams/10-redis-capacity-planning.png)
<!-- GENERATED EXCALIDRAW: ./diagrams/10-redis-capacity-planning.excalidraw -->
<!--
ORIGINAL IMAGE NOTES
Title: Redis capacity planning
What to use: Four parallel calculations for memory, operations per second, network and hot-key limits. Merge them using max() into required primary shards, then multiply by replicas and place across availability zones.
Preferred source: Create an original diagram using the formulas in this guide.
Search terms: Redis capacity planning memory overhead shard throughput network replicas
Purpose: Show that Redis shard count is not based on dataset size alone.
Alt text: Redis capacity planning takes the maximum shard count required by memory, throughput, network and hot-key constraints, then adds replicas.
Editorial note: Label all example numbers as interview assumptions.
-->

---

# System-Design Use Cases

## 67. Database Cache

Requirement:

```text
Serve product details at high QPS with up to five minutes of staleness.
```

Design:

```text
key: product:{productId}
type: String or Hash
TTL: 5 minutes plus jitter
pattern: cache-aside
source of truth: PostgreSQL
```

Read flow:

```text
GET -> hit: return
    -> miss: read PostgreSQL -> SET EX -> return
```

Write flow:

```text
commit PostgreSQL -> DEL cache key
```

Failure behavior:

- Redis unavailable: fall back to the database with rate limiting and circuit breaking.
- Database unavailable but stale cache present: serve stale only if the product requirement permits it.

## 68. Session Store

```text
key: session:{randomSessionId}
type: Hash, JSON or String
TTL: inactivity or absolute session timeout
```

Example:

```redis
HSET session:abc userId 17 role editor createdAt 1783960000
EXPIRE session:abc 1800
```

Consider:

- Does every read extend TTL?
- Can a replica-lagged read incorrectly log out a user?
- What happens when Redis loses all session data?
- Are permissions cached longer than their revocation budget?
- Is the session payload encrypted or limited to non-sensitive identifiers?

## 69. Fixed-Window Rate Limiter

Key:

```text
rate:{subject}:{operation}:{windowStart}
```

Example:

```text
rate:user-17:login:2026-07-13T20:05
```

Atomic logic:

```lua
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return count
```

Decision:

```text
allow when count <= limit
reject when count > limit
```

Do not issue `INCR` and `EXPIRE` as unrelated operations; a crash between them can leave a counter without TTL.

## 70. Sliding-Window Log Rate Limiter

Use a sorted set:

```text
key    = rate:{subject}:{operation}
member = unique request ID
score  = request timestamp
```

Atomic steps:

```text
1. Remove scores older than window start.
2. Count remaining members.
3. If below limit, add current request.
4. Refresh TTL.
5. Return allow or reject.
```

Trade-offs:

- Precise rolling window.
- `O(limit)` memory per active subject in the worst case.
- More CPU and memory than a fixed-window counter.
- Must use one atomic script to avoid races.

## 71. Token-Bucket Rate Limiter

Store:

```text
tokens remaining
last refill timestamp
```

For each request:

```text
elapsed = now - lastRefill
newTokens = min(capacity, oldTokens + elapsed × refillRate)

if newTokens >= cost:
    allow and subtract cost
else:
    reject
```

Use one Lua script so refill and consumption are atomic. The token bucket allows short bursts up to bucket capacity while enforcing the long-term refill rate.

![Redis rate-limiter algorithms](./diagrams/11-redis-rate-limiters.png)
<!-- GENERATED EXCALIDRAW: ./diagrams/11-redis-rate-limiters.excalidraw -->
<!--
ORIGINAL IMAGE NOTES
Title: Redis rate-limiter algorithms
What to use: Three side-by-side flows: fixed-window counter with INCR+TTL, sliding-window sorted set with remove/count/add, and token bucket with refill/consume state. Mark every flow as one atomic script and show fail-open versus fail-closed as a separate policy decision.
Preferred source: Create an original diagram using the algorithms in this guide.
Search terms: Redis fixed window sliding window sorted set token bucket Lua rate limiter
Purpose: Connect Redis structures and atomicity to common HLD rate-limiter algorithms.
Alt text: Redis implements fixed-window, sliding-window and token-bucket rate limits using atomic counters, sorted sets and scripts.
Editorial note: Do not mix Redis replication acknowledgement or generic consistency-level concepts into the algorithm steps.
-->

## 72. Leaderboard

```text
key: leaderboard:{game}:{period}
type: Sorted Set
score: player score
member: player ID
```

```redis
ZINCRBY leaderboard:chess:2026-W29 15 user-17
ZREVRANGE leaderboard:chess:2026-W29 0 99 WITHSCORES
ZREVRANK leaderboard:chess:2026-W29 user-17
```

Challenges:

- One global leaderboard can become hot.
- Tie-breaking may need a composite score or a separate rule.
- Historical periods need TTL or archival.
- A very large leaderboard may need regional or bucketed partial rankings and a merge step.

## 73. Exact Counter

```redis
INCR video:42:views
```

This is exact within the current Redis primary's accepted command history, but end-to-end business accuracy still depends on:

- Event deduplication.
- Retry semantics.
- Failover write loss.
- Persistence.
- Whether a view should be counted before or after validation.

For a high-volume durable analytics count:

```text
events -> Kafka -> stream processor -> durable aggregate store
                            \-> Redis for low-latency serving
```

## 74. Sharded Counter

To remove one hot write key:

```text
views:{videoId}:0
views:{videoId}:1
...
views:{videoId}:N-1
```

Write to a selected shard. Read and sum all `N` values.

Trade-offs:

- Higher write scalability.
- More expensive reads.
- The total is not one atomic value.
- Hash tags must be chosen carefully: placing all partial counters in one Redis Cluster slot defeats cross-shard write scaling.

## 75. Idempotency Key

```redis
SET idempotency:payment:req-123 processing NX EX 86400
```

Typical states:

```text
absent -> processing -> completed(response reference)
```

Requirements:

- Define what happens when processing exceeds TTL.
- Store enough result metadata to return the original outcome.
- Keep the final record for the maximum retry window.
- Use the durable database's unique constraint for irreversible financial correctness when possible.

Redis can reduce duplicate work, but a lost Redis record must not allow an unsafe duplicate external side effect.

## 76. Deduplication

Exact short-window deduplication:

```redis
SET dedupe:{consumer}:{eventId} 1 NX EX 86400
```

If the command returns success, process the event. If the key already exists, treat it as a duplicate.

Risk:

- Marking before processing can suppress a retry after a crash.
- Marking after processing can repeat the side effect after a crash.

For exactly-once business effects, combine idempotent side effects or a transactional inbox/outbox with a durable database constraint.

## 77. Presence and Heartbeats

```redis
SET presence:user-17 online EX 30
```

The client refreshes the key before expiry. Missing or expired means offline or unknown.

Presence is inherently approximate because:

- Heartbeats can be delayed.
- Clients can disconnect without notice.
- Expiration cleanup and notification time are not exact.

State the allowed detection delay, such as 30-60 seconds.

## 78. Delayed Jobs

Use a sorted set where score is the execution time:

```redis
ZADD jobs:scheduled 1783960200000 job-123
```

Workers atomically claim due jobs.

Challenges:

- Prevent two workers from claiming the same job.
- Recover jobs from crashed workers.
- Bound the sorted-set size.
- Persist enough state for required durability.
- Use idempotent job handlers.

For a general durable scheduler with long retention and complex retries, a purpose-built queue or workflow engine may be better.

## 79. Pub/Sub

Redis Pub/Sub sends messages to currently connected subscribers.

Properties:

- Low-latency broadcast.
- At-most-once delivery.
- No durable backlog for disconnected consumers.
- No acknowledgement or replay.

Redis documents Pub/Sub as [at-most-once delivery](https://redis.io/docs/latest/develop/pubsub/#delivery-semantics).

Good uses:

- Live invalidation hints.
- Ephemeral UI updates.
- Non-critical presence events.

Poor uses:

- Payment events.
- Durable job queues.
- Anything requiring replay after disconnect.

## 80. Streams Versus Pub/Sub Versus Kafka

| Requirement | Pub/Sub | Redis Streams | Kafka |
|---|---|---|---|
| Connected real-time broadcast | Strong fit | Possible | Possible |
| Message retained for replay | No | Yes, within configured retention | Yes |
| Consumer groups | No | Yes | Yes |
| Pending-entry tracking | No | Yes | Consumer-offset model |
| Very long retention | Poor fit | Memory-expensive | Strong fit |
| Very large durable event backbone | Poor fit | Limited/conditional | Strong fit |
| Operational simplicity for small real-time queue | Strong | Strong | Heavier |

![Redis Streams consumer group](./diagrams/12-redis-stream-consumer-group.png)
<!-- GENERATED EXCALIDRAW: ./diagrams/12-redis-stream-consumer-group.excalidraw -->
<!--
ORIGINAL IMAGE NOTES
Title: Redis Streams consumer group
What to use: Producer appends entries to one stream. One consumer group distributes entries to two consumers. Show last-delivered ID, each consumer's pending entries, XACK after success and XAUTOCLAIM/recovery after a consumer crash. Add a small contrasting Pub/Sub lane with no backlog.
Preferred source: Create an original diagram based on official Redis Streams and Pub/Sub documentation.
Search terms: Redis Streams consumer groups pending entries XACK XAUTOCLAIM PubSub at most once
Purpose: Explain durable-ish short-retention processing versus ephemeral broadcast.
Alt text: Redis Streams retain entries and track pending consumer-group deliveries, while Pub/Sub loses messages when subscribers are disconnected.
Editorial note: Label stream processing at-least-once and require idempotent consumers.
-->

---

# Failure Scenarios

## 81. Cache Node Is Unavailable

Possible policy:

```text
read request -> bypass cache -> query database
```

Risk:

- The database may receive the entire cache QPS and fail.

Mitigations:

- Circuit breaker.
- Backend concurrency limit.
- Request coalescing.
- Stale local cache.
- Load shedding.
- Gradual cache warm-up after recovery.

## 82. Primary Fails Before Replication

Outcome:

- The client may have received success.
- The promoted replica may not contain the write.

Mitigations:

- Accept the bounded risk for disposable cache state.
- Use `WAIT` selectively.
- Use stronger AOF policy for local durability.
- Keep authoritative state in a durable database.
- Make operations idempotent so clients can retry safely.

## 83. Client Times Out

A timeout is ambiguous:

```text
command may not have reached Redis
command may have executed but reply was lost
command may still be queued or in flight
```

Safe retries:

- `SET key deterministicValue` is often idempotent.
- `INCR` is not idempotent under blind retry.
- A Lua script that records a request ID can make a compound operation idempotent.

## 84. Replica Is Stale

Outcome:

- Replica read can return old data or miss a recent key.

Use primary reads for:

- Read-your-write requirements.
- Authorization revocation.
- Lock or lease ownership.
- Rate-limit enforcement after a write.

## 85. Entire Availability Zone Fails

The deployment survives only if:

- Each primary has a replica in another zone.
- The control plane can reach quorum or majority as required.
- Failover does not place primary and replica in the same failed domain.
- Remaining nodes have enough CPU and memory.

Test zone failure. A diagram with replicas across zones is not proof of failover capacity.

## 86. Memory Limit Is Reached

With an eviction policy:

- Redis evicts candidate keys.
- Cache hit rate can collapse.
- Backend load rises.

With `noeviction`:

- Writes that require more memory fail.
- Reads may continue.

Alert before the limit and monitor eviction rate, rejected writes and memory fragmentation.

## 87. Persistence Fork Causes Memory Pressure

During background snapshot or rewrite, modified pages can be copied because of copy-on-write.

Outcome:

- Resident memory grows.
- The operating system can kill the process.
- Latency can spike.

Mitigations:

- Leave memory headroom.
- Monitor fork time and copy-on-write bytes.
- Avoid bursty write workloads during maintenance where possible.
- Benchmark persistence on production-like datasets.

## 88. Hot Key Saturates One Shard

Symptoms:

- One shard has high CPU while others are idle.
- Tail latency rises for unrelated keys on that shard.
- Adding shards does not help the hot key.

Mitigate at the access-pattern level: local caching, key splitting, batched writes or asynchronous aggregation.

## 89. Cluster Resharding

During slot migration:

- Clients may receive `MOVED`, `ASK` or transient errors.
- Large keys take longer to move.
- Network and CPU usage increase.

Use cluster-aware clients, bounded retries and operational rate limits for resharding.

## 90. Region Failure

Questions to answer:

- Is another region receiving Redis replication?
- What is the replication lag?
- How do clients discover the new endpoint?
- Can the application rebuild Redis from the durable source?
- Which writes can be lost?
- Does the product fail open, fail closed or degrade?

For cache workloads, rebuilding can be simpler than treating cross-region Redis as the source of truth.

---

# Operational Considerations

## 91. Metrics to Monitor

### Latency and traffic

- Commands per second.
- p50, p95 and p99 client latency.
- Slow command log.
- Timeouts and retries.
- Network input and output.

### Memory

- Used memory.
- RSS.
- Fragmentation ratio.
- `maxmemory` utilization.
- Evictions and expirations.
- Client and replication buffers.
- Fork copy-on-write usage.

### Replication and availability

- Replica lag.
- Replication link status.
- Full versus partial resynchronization.
- Failover count and duration.
- Cluster slots and node health.

### Key distribution

- Big keys.
- Hot keys.
- Key count by data type.
- TTL distribution.
- Shard memory and QPS skew.

## 92. Slow-Command Controls

Use:

- Command time-complexity review.
- Slow log.
- Latency monitoring and `LATENCY DOCTOR`.
- `redis-cli --bigkeys` or safer sampling in production.
- Client-side tracing.

Do not run expensive diagnostic scans without considering their production impact.

## 93. Backups and Restore Tests

Backups are useful only if restore is tested.

Validate:

- Backup frequency and retention.
- Encryption and access controls.
- Cross-region copy if required.
- Restore duration for the real dataset size.
- Application behavior while the cache or primary store is cold.
- Recovery from accidental deletion, not only node loss.

## 94. Security

Use:

- Private networking.
- TLS where required.
- ACLs with least privilege.
- Credential rotation.
- Command restrictions for dangerous administrative operations.
- Separate deployments or strong boundaries for different trust levels.

Never expose Redis directly to the public internet.

## 95. Deployment Separation

Separate Redis deployments when workloads have incompatible policies:

```text
cache: allkeys-lfu, disposable, aggressive TTL
sessions: noeviction, stronger persistence, tighter access control
rate limits: noeviction or dedicated memory budget, fail-policy defined
streams: bounded retention, consumer monitoring
```

One shared cluster couples memory pressure, failure, maintenance and noisy-neighbor risk.

## 96. Benchmark the Real Command Mix

A useful benchmark includes:

- Realistic key and value sizes.
- Read/write ratio.
- Pipelining behavior.
- TLS.
- Persistence settings.
- Replica traffic.
- Hot-key distribution.
- Expiration churn.
- Failover and resharding.
- p99 latency, not only average operations per second.

`redis-benchmark` can show a baseline. An application-shaped benchmark is required for capacity decisions.

---

# Redis Versus Other Databases

## 97. Redis Versus PostgreSQL

| Dimension | Redis | PostgreSQL |
|---|---|---|
| Primary storage | Memory | Disk-backed buffer-cache architecture |
| Access pattern | Key and data-structure operations | SQL, indexes, joins |
| Transactions | Atomic command; limited grouped operations | Full ACID relational transactions |
| Constraints | Application-defined | Unique, foreign key, check constraints |
| Durability | Configurable; failover loss must be considered | Stronger system-of-record default |
| Dataset economics | RAM-priced working set | Larger disk-resident datasets |
| Best use | Cache and real-time shared state | Authoritative transactional data |

Common combination:

```text
PostgreSQL = source of truth
Redis      = low-latency serving and derived state
```

## 98. Redis Versus Cassandra

| Dimension | Redis | Cassandra |
|---|---|---|
| Storage | Primarily memory | Disk-based LSM storage |
| Typical latency | Lower for small key operations | Low milliseconds, generally higher than Redis |
| Data volume | Memory-bounded working set | Large durable datasets across disks/nodes |
| Atomic primitives | Rich counters, sets, sorted sets, scripts | Row/partition mutations; LWT is costlier |
| TTL behavior | Direct expiration/eviction | TTL produces tombstones and compaction work |
| Scaling | Hash-slot sharding | Token-range partitioning |
| Replication | Primary-replica per shard, asynchronous | Peer replicas with tunable consistency |
| Best use | Synchronous enforcement and cache | Durable high-write history by known partition key |

Rate-limiter answer:

```text
Use Redis for the synchronous decision because it provides atomic increments/scripts,
native TTL and lower latency. Cassandra can persist limit events or long-term usage,
but using it for every request adds a heavier coordination and storage path.
```

## 99. Redis Versus Memcached

| Dimension | Redis | Memcached |
|---|---|---|
| Values | Multiple data structures | Primarily opaque values |
| Persistence | Optional | No durable persistence model |
| Replication/failover | Built-in options | Usually client/platform managed |
| Atomic operations | Rich | Simpler counters and CAS |
| Best use | Advanced cache and shared real-time state | Simple distributed cache |

Choose Memcached when only a simple disposable cache is required and its operational model fits. Choose Redis when TTL plus richer atomic structures, replication or persistence provide direct value.

## 100. Redis Versus Kafka

| Dimension | Redis Streams | Kafka |
|---|---|---|
| Main model | In-memory data store with stream type | Distributed durable log |
| Retention | Must be bounded for memory economics | Designed for long durable retention |
| Consumer groups | Supported | Core model |
| Replay | Supported within retained entries | Strong long-term replay |
| Scale | Good for compact real-time pipelines | Better for very large event backbones |
| Other structures | Rich Redis structures | Log records only |

Use Redis Streams for a small, low-latency operational stream close to Redis data. Use Kafka for the durable enterprise event backbone.

## 101. Redis Versus ClickHouse

| Requirement | Redis | ClickHouse |
|---|---|---|
| Point lookup/counter serving | Strong | Possible but not primary strength |
| Complex aggregation | Limited/precomputed | Strong |
| Historical scans | Poor fit | Strong |
| Data retention | Memory-expensive | Disk-efficient columnar storage |
| Typical role | Real-time result cache | Analytical source and computation |

Common combination:

```text
events -> ClickHouse -> precomputed result -> Redis -> dashboard API
```

## 102. Redis Versus Elasticsearch/OpenSearch

| Requirement | Redis | Search engine |
|---|---|---|
| Direct key lookup | Strong | Higher overhead |
| Exact membership/ranking | Strong structures | Possible |
| Full-text relevance | Requires Redis search capability | Core strength |
| Fuzzy matching | Specialized capability | Core strength |
| Large inverted indexes | Deployment-dependent | Core design |

Do not model full-text search as `SCAN` plus string matching in Redis.

## 103. Redis Versus DynamoDB

| Dimension | Redis | DynamoDB |
|---|---|---|
| Storage | Memory-first | Managed durable NoSQL |
| Latency | Typically lower | Low-millisecond managed service |
| Durability | Configurable and topology-dependent | Durable system-of-record design |
| Atomic structures | Rich server-side structures/scripts | Conditional item operations and transactions |
| Operations | Self/managed Redis choices | Fully managed AWS service |
| Best use | Cache and fast shared state | Durable key-value/document data |

They are often complementary rather than direct substitutes.

---

# Common Mistakes

## 104. Saying Only "Redis Is Fast"

Speed is a consequence, not a complete selection criterion.

Better answer:

```text
The request needs an atomic counter with a 60-second TTL at high QPS.
Redis supports this directly and keeps the decision path in memory.
```

## 105. Treating Redis as an Unlimited Cache

Every cache needs:

- A memory limit.
- An eviction policy.
- TTL or invalidation.
- Backend protection during misses.
- A plan for cold start.

## 106. Using `KEYS` in a Request Path

This turns a direct-access store into a keyspace scan and can block a shard.

Create an explicit index or derive the key.

## 107. Ignoring Big Keys

One huge hash, set, list or value creates CPU, network, replication, deletion and migration problems.

Define maximum cardinality and bucket the data.

## 108. Assuming Replication Prevents Data Loss

Redis replication is normally asynchronous. A promoted replica can miss an acknowledged write.

State whether that is acceptable.

## 109. Assuming AOF Means Zero Data Loss

Durability depends on fsync policy, host failure, storage behavior and replication topology.

State the RPO instead of saying "AOF is durable."

## 110. Using Multiple Commands Without Atomicity

Example:

```text
INCR key
EXPIRE key 60
```

A failure between commands leaves incorrect state. Use an atomic script or a command that encodes the full operation.

## 111. Long Lua Scripts

Atomic does not mean free. A long script blocks command execution on the shard.

Keep logic bounded and move large computation out of Redis.

## 112. Cross-Slot Transaction Design

Keys in a Redis Cluster transaction or script must be co-located.

Do not discover this restriction after choosing independent key names. Design hash tags and hotspot risk upfront.

## 113. Blind Retry of Non-Idempotent Commands

A timed-out `INCR`, list pop or job claim may already have executed.

Use request IDs, idempotent state transitions or application reconciliation.

## 114. Mixing Critical Data and Disposable Cache Entries

One eviction policy and memory limit now govern both workloads. Separate them.

## 115. Using Pub/Sub for Durable Events

Disconnected subscribers miss messages permanently. Use Streams, Kafka or another durable broker.

## 116. Using Redis Locks Without Fencing

A paused client can act after its lease expires. Use fencing for external resources or enforce correctness in the authoritative store.

## 117. Scaling Shards Without Solving a Hot Key

One key remains on one shard. Redesign the key or cache/aggregate closer to clients.

## 118. Ignoring Cache-Failure Load

If Redis serves 90% of 1 million QPS, a total miss can send close to 1 million QPS to the database. The fallback path must be limited.

---

# Interview Decision Framework

## 119. Choose Redis When

```text
known key-based access pattern
+ very low latency requirement
+ bounded memory footprint
+ useful atomic data structure or TTL
+ acceptable durability/failover semantics
+ explicit hot-key and failure plan
```

## 120. Avoid Redis When

```text
large disk-resident history
or arbitrary filters/joins
or strongly durable multi-record transactions
or unbounded values/streams
or zero acknowledged-write loss
```

## 121. HLD Design Checklist

Before finalizing Redis in a system-design interview, answer:

1. Is Redis a cache, derived store or source of truth?
2. What exact key is derived from each request?
3. Which Redis data type and commands are used?
4. What is the command complexity and maximum result size?
5. Which operations must be atomic?
6. Are all multi-key operations in one cluster slot?
7. What is the TTL or retention rule?
8. What is the memory limit and eviction policy?
9. What is the p99 key/value size?
10. What is the hot-key strategy?
11. How many primary shards are required for memory and throughput?
12. How many replicas are required and where are they placed?
13. Which persistence mode meets the RPO?
14. Can acknowledged writes be lost during failover?
15. Are replica reads allowed to be stale?
16. What happens when Redis is unavailable?
17. Can the backing database survive a cache miss storm?
18. Which metrics and alerts detect failure early?
19. How is backup restore tested?
20. Which assumption must be verified by load testing?

## 122. Interview Answer Template

```text
I would use Redis as <cache / derived state / primary store> for <specific requirement>.

The key is <key pattern>, the value is a <Redis data type>, and the main commands are
<commands>. This makes <required operation> atomic and avoids a database round trip.

The data has a TTL of <time> and the deployment uses <eviction policy>. The working set
is approximately <memory calculation>, so I need <N> primary shards plus <replicas>.

Redis replication is asynchronous, so failover can lose a recently acknowledged write.
That is <acceptable / not acceptable> because <reason>. For durable truth, I keep
<database or event log> as the source of record.

The main risks are <hot key, big key, cache stampede, cross-slot operation or durability>,
which I handle using <specific mitigation>.
```

---

# Interview Questions and Answers

## 123. Why Is Redis Fast?

Redis serves data from memory, uses direct key lookups and optimized structures, and avoids interleaving inside an individual command's shard execution. For small commands, network RTT often dominates server processing. Redis can still become slow because of big keys, expensive commands, long scripts, persistence work, network limits or hot shards.

## 124. Is Redis Single-Threaded?

The interview-safe answer is that command execution against a shard is largely serialized, which makes individual commands atomic and means a slow command can block others on that shard. Modern Redis uses additional threads and background processes for selected networking, persistence and maintenance work, so saying "the whole server has only one thread" is inaccurate.

## 125. Can Redis Be a Primary Database?

Yes, for bounded workloads whose query model, memory economics, persistence RPO and asynchronous failover semantics are acceptable. It is more commonly used as a cache or derived real-time store because relational databases and durable NoSQL systems provide stronger system-of-record defaults.

## 126. What Is the Difference Between TTL and Eviction?

TTL is an application-defined lifetime. Eviction is memory-pressure removal governed by `maxmemory` and the eviction policy. A key can expire without memory pressure or be evicted before its TTL ends.

## 127. What Happens When Redis Reaches `maxmemory`?

With an eviction policy, Redis removes eligible keys according to that policy. With `noeviction`, write commands that need more memory fail while reads can continue. The application must monitor and handle either behavior.

## 128. Which Eviction Policy Should I Use?

For a dedicated general cache, `allkeys-lru` or `allkeys-lfu` is a common starting point, selected based on recency versus frequency. For primary or non-disposable data, use `noeviction` and capacity alerts. Do not mix critical and disposable data under one policy.

## 129. What Is Cache-Aside?

The application reads Redis first. On a miss, it reads the source database and populates Redis. On write, it commits the database and invalidates the cache. Redis is not the source of truth, and TTL bounds failures in invalidation.

## 130. How Do You Prevent a Cache Stampede?

Use per-key single-flight or a short rebuild lock, TTL jitter, stale-while-revalidate, proactive refresh and backend concurrency limits. The goal is to ensure one or a small number of callers rebuild a hot entry rather than every caller querying the database.

## 131. Why Is `INCR` Better Than `GET` Followed by `SET`?

`INCR` is one atomic server-side operation. `GET`, client-side addition and `SET` is a race: concurrent clients can read the same value and overwrite each other's updates.

## 132. Does `MULTI/EXEC` Roll Back on Error?

No. It queues commands and executes them without other clients interleaving, but it does not provide relational-style rollback for runtime command errors. `WATCH` adds optimistic concurrency by aborting if watched keys changed before `EXEC`.

## 133. When Should I Use Lua?

Use Lua or Redis Functions for short, bounded, atomic logic combining several Redis operations, such as a rate-limit decision. Avoid long loops or large scans because script execution blocks other commands on the shard.

## 134. How Does Redis Cluster Shard Data?

It hashes each key into one of 16,384 slots. Primary nodes own subsets of slots, and cluster-aware clients route commands to the owner. Slots can be moved during resharding.

## 135. Does Redis Cluster Use Consistent Hashing?

No. It uses fixed hash slots computed from CRC16 of the key modulo 16,384, with slot ranges assigned to nodes.

## 136. Why Do Cross-Slot Commands Fail?

A multi-key command, transaction or script normally executes on one shard. If keys map to different shards, Redis cannot provide the single-shard operation and returns `CROSSSLOT`. Hash tags can co-locate related keys, but excessive co-location can create hotspots.

## 137. Can Redis Lose an Acknowledged Write?

Yes. Replication is normally asynchronous. A primary can acknowledge a write, fail before the replica receives it and cause a replica without the write to be promoted. `WAIT` reduces the probability but does not turn Redis Cluster into a fully strongly consistent database.

## 138. Sentinel Versus Redis Cluster?

Sentinel provides monitoring, discovery and failover for a non-sharded primary-replica deployment. Redis Cluster provides sharding across 16,384 slots plus per-shard replication and failover.

## 139. RDB Versus AOF?

RDB creates periodic point-in-time snapshots and can lose writes since the last snapshot. AOF logs writes and can provide a smaller recovery-point window depending on fsync policy, at the cost of more write I/O. They can be combined.

## 140. Why Are Big Keys Dangerous?

A large value or collection makes commands, network transfer, replication, persistence, deletion and slot migration expensive. It also remains on one shard. Bound cardinality and split data into meaningful buckets.

## 141. How Do You Handle a Hot Key?

Use local or client-side caching for reads, split write-heavy counters into partial keys, batch updates, precompute popular data or isolate the workload. Adding generic shards does not divide a single key.

## 142. Redis Pub/Sub Versus Streams?

Pub/Sub is ephemeral and at-most-once; disconnected clients miss messages. Streams retain entries, support consumer groups, pending delivery and acknowledgement, enabling at-least-once processing with idempotent consumers.

## 143. Redis Streams Versus Kafka?

Redis Streams fits compact low-latency operational pipelines with bounded retention. Kafka is the stronger choice for a large durable event backbone, long retention, extensive replay and many independent consumers.

## 144. Why Use Redis for Rate Limiting Instead of Cassandra?

Redis offers atomic counters and scripts, native TTL and lower latency on the synchronous decision path. Cassandra is better suited to durable, high-volume history by partition key, but per-request enforcement would use a heavier disk-oriented distributed path.

## 145. Is a Redis Distributed Lock Sufficient?

It can coordinate best-effort leases, but a lease owner can pause past expiry and later perform a stale action. Use unique tokens, atomic release and fencing tokens for external resources. Prefer database constraints or state transitions when the authoritative database can enforce the invariant.

## 146. How Do You Size Redis?

Estimate keys, values, data-structure overhead, fragmentation, buffers and persistence headroom. Divide by the target memory utilization. Separately compute shards for measured throughput and network, then take the maximum and add replicas plus failure headroom.

## 147. What Happens If Redis Goes Down?

The answer depends on its role. A cache may fall back to a protected database; a rate limiter must explicitly fail open or closed; a session store may temporarily reject or log out users; a primary Redis store needs persistence and failover. The fallback must be capacity-tested.

## 148. What Is the Biggest Redis Design Mistake?

Treating Redis as an unlimited, automatically durable, uniformly scalable memory map. A correct design specifies access patterns, atomicity, TTL, eviction, memory, hot keys, persistence, failover loss and fallback behavior.

---

# Thirty-Second Summary

Redis is an in-memory data-structure store used for caches and low-latency shared state. Choose it when requests can derive a key directly and benefit from atomic counters, hashes, sets, sorted sets, streams or TTL. Keep commands and values bounded, avoid scans, plan for big and hot keys, and use pipelining to reduce round trips. Expiration and eviction are separate; configure both memory limits and policy deliberately. RDB and AOF provide configurable restart durability, while replication and Sentinel or Cluster provide availability. Redis Cluster shards 16,384 hash slots and requires related multi-key operations to share a slot. Replication is asynchronous, so failover can lose recently acknowledged writes. In interviews, always state whether Redis is a cache or source of truth, calculate memory and shard count, define the failure policy and keep correctness-critical durable state in an appropriate authoritative system.

---

# Official References

- [Redis data types](https://redis.io/docs/latest/develop/data-types/)
- [Redis key expiration](https://redis.io/docs/latest/commands/expire/)
- [Redis key eviction](https://redis.io/docs/latest/develop/reference/eviction/)
- [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- [Redis replication](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/)
- [Redis Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/)
- [Redis Cluster scaling](https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/)
- [Redis Cluster specification](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/)
- [Redis multi-key operations](https://redis.io/docs/latest/develop/using-commands/multi-key-operations/)
- [Redis transactions](https://redis.io/docs/latest/develop/using-commands/transactions/)
- [Redis scripting with Lua](https://redis.io/docs/latest/develop/programmability/eval-intro/)
- [Redis pipelining](https://redis.io/docs/latest/develop/using-commands/pipelining/)
- [Redis Streams](https://redis.io/docs/latest/develop/data-types/streams/)
- [Redis Pub/Sub](https://redis.io/docs/latest/develop/pubsub/)
- [Redis latency guidance](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/)
- [Redis memory optimization](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/)
