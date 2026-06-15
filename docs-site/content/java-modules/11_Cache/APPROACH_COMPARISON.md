# Approach Comparison

## Existing Packages

`A_basic` demonstrates the minimum in-memory cache shape: named caches, cache entries, a facade API, and datastore-backed put, get, update, and remove operations.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- The system supports multiple distinct caches, such as `UserCache`, `SessionCache`, or `ProductCache`.
- Each cache has a unique cache ID, a configured capacity, and a list of entry IDs that belong to that cache.
- Each cache entry stores one key-value pair; in A_basic, both key and value are modeled as strings for simplicity.
- Entries are stored separately from cache metadata, and an entry ID is derived as `cacheId::key` to avoid key collisions across caches.
- The capacity value exists on the cache object, but A_basic treats it as metadata and does not enforce it yet.


Action based points:
- Admin creates a named cache with a specified capacity.
- User inserts a key-value pair into a cache using `put`.
- If the key already exists in that cache, `put` updates the existing `CacheEntry` instead of creating a second entry.
- User reads a value using `get`, which resolves the entry ID from `cacheId` and `key`.
- User removes a value using `remove`, which deletes the entry from the entry datastore.
- In a complete interview solution, the system should check capacity before insert and evict according to a policy such as LRU, LFU, FIFO, or TTL-aware eviction.

Misc:
- A_basic is intentionally focused on object modeling and API flow, not production cache behavior.
- A_basic does not enforce capacity and does not evict entries when the cache is full.
- A_basic does not validate missing cache IDs, missing keys, duplicate cache creation, invalid capacity, or null keys/values.
- `remove` deletes the `CacheEntry` from the datastore but does not remove the entry ID from `Cache.cacheEntryList`, so the list can contain stale IDs.
- There is no TTL, expiry cleanup, write policy, metrics, persistence, serialization, or distributed behavior.
- Eviction policy, TTL, metrics, and concurrency should be introduced as follow-up design extensions.

#### Common Misc

Offline or online:
- Treat as an in-process library/API cache, not a distributed service.
- The current datastore uses in-memory maps, so data is lost when the process exits.
- For an interview, call out that a distributed cache would need remote storage, network APIs, replication, consistency decisions, and failure handling.

Extensibility:
- Eviction should become a strategy, such as `EvictionPolicy`, so LRU, LFU, FIFO, and custom policies can be swapped without changing the facade API.
- Expiry should become a separate concern, such as `ExpiryPolicy` or TTL metadata on entries.
- Value type can be generalized from `String` to generic `V`, and key type can be generalized from `String` to generic `K`.
- Storage can remain behind the `DataStore` interface so in-memory, persistent, or distributed implementations can be added later.
- Metrics such as hits, misses, evictions, entry count, and latency can be added without changing core entity responsibilities.

History and undo:
- Not needed for a cache because cache writes are usually transient and optimized for lookup speed.
- If required, history should be modeled separately as an audit/event log, not inside the cache entry itself.

Notifications:
- Not needed in A_basic.
- In a fuller design, optional callbacks can notify listeners about eviction, expiry, update, or removal events.

Exception handling:
- Missing cache should return a clear error instead of causing a null pointer failure.
- Missing key can return `null`, `Optional`, or a typed `CacheMiss` result depending on API style; the choice should be consistent.
- Invalid capacity should be rejected during cache creation.
- Duplicate cache IDs should either be rejected or treated as an explicit replace operation.
- Capacity overflow should be handled by eviction if an eviction policy exists; otherwise the insert should fail with a clear error.
- Removal should keep cache metadata and entry storage consistent.

Concurrency:
- Concurrent put, get, update, and remove are deferred in A_basic.
- A production in-memory cache needs thread-safe maps and safe mutation of per-cache entry metadata.
- `put` must be atomic across entry creation and cache metadata update; otherwise one thread can see a partial write.
- Capacity checks and eviction must be atomic, because two concurrent inserts can both observe available space and exceed capacity.
- Per-cache locks, striped locks, `ConcurrentHashMap`, or read-write locks are common interview-level options.

### UseCase Diagram

Actors:
- User
- Admin
- System

UseCases:
- addCache(Admin) -> validate cache id and capacity(System) -> create Cache(System) -> store Cache(System)
- put(User) -> validate cache exists(System) -> derive entry id(System) -> update existing CacheEntry or create new CacheEntry(System) -> attach entry id to Cache(System)
- get(User) -> validate cache exists(System) -> derive entry id(System) -> read CacheEntry(System) -> return value or cache miss(System)
- remove(User) -> validate cache exists(System) -> derive entry id(System) -> remove CacheEntry(System) -> remove entry id from Cache metadata(System)
- evict(System) -> select victim by policy(System) -> remove victim entry(System) -> update Cache metadata(System)

### Class Diagram

Core entities:
- `Cache(cacheId, capacity, cacheEntryList)` stores cache metadata and the entry IDs owned by that cache.
- `CacheEntry(cacheEntryId, key, value)` stores one cached key-value pair.
- `DataStore` abstracts storage for caches and cache entries.
- `InMemoryDataStore` implements `DataStore` using maps.
- `CacheFacade` exposes the user/admin API and coordinates datastore operations.

Method placement:
- `addCache` belongs in the facade because it is an admin operation that creates and stores cache metadata.
- `put` belongs in the facade because it coordinates cache lookup, entry ID generation, insert/update behavior, and cache metadata.
- `get` belongs in the facade because callers should not know how entry IDs are derived or where entries are stored.
- `remove` belongs in the facade because it must keep the entry datastore and cache metadata consistent.
- `updateValue` belongs in `CacheEntry` because it only mutates the value of one entry.
- Eviction selection should not live inside the facade long term; it should move to an eviction policy strategy once capacity enforcement is implemented.
