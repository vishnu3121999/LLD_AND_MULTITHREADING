# Approach Comparison

## Existing Packages

`A_basic` implements an offline, in-memory, generic cache with TTL and enum-driven eviction logic.

`B_Strategy` keeps the same cache domain but moves eviction selection into O(1) strategy implementations such as LRU, LFU, and FIFO.

## A_basic Design Analysis

### A_basic Scope Boundary

- Build the first runnable cache model and facade flow.
- Treat cache as an offline/in-process component, not a distributed cache service.
- Keep happy-path inputs and simple cache-miss behavior.
- Include TTL and eviction because they are core cache behavior for this problem.
- Do not implement Strategy, Factory, Observer, Command, State, Memento, concurrency, persistence, detailed exception handling, or advanced validation in `A_basic`.
- Mention future extensibility candidates, but keep implementation enum-driven and direct.

### Requirements

#### System Specific Requirements

Physical Structure based points:
- The system supports multiple named caches.
- Each cache has a unique `cacheId`, fixed capacity, `CacheConfig`, and `cacheEntryList`.
- Each cache entry stores one generic key-value pair using `K` and `V`.
- Each entry tracks cache metadata required for TTL and eviction:
  - `createdAtMillis`
  - `lastAccessedAtMillis`
  - `expiresAtMillis`
  - `ttlMillis`
  - `hasTtl`
  - `createdOrder`
  - `lastAccessedOrder`
  - `accessCount`
- Entries are stored independently from cache metadata.
- A cache stores entry IDs, not `CacheEntry` objects.
- Entry IDs are derived as `cacheId::key` so different caches can use the same key value.

Action based points:
- Admin creates a cache with capacity and config.
- User puts a key-value pair into a cache.
- User can put without TTL, with the cache default TTL, or with a custom TTL.
- A default TTL of `0` means entries inserted through the simple `put` method do not have TTL.
- User gets a value by cache ID and key.
- User removes a key from a cache.
- System removes expired entries lazily during `put` and `get`.
- System evicts one entry when capacity is full.
- System supports basic eviction types through an enum:
  - `LRU`
  - `LFU`
  - `FIFO`
  - `TTL_AWARE_LRU`
  - `TTL_AWARE_LFU`
  - `TTL_AWARE_FIFO`
- TTL-aware eviction means only entries with TTL set are eligible victims.
- If a strict TTL-aware eviction policy has no eligible victim, `evictOneEntry` returns `null` and `put` leaves the cache unchanged.
- System supports basic expiry types through an enum:
  - `EXPIRE_AFTER_WRITE`
  - `EXPIRE_AFTER_ACCESS`

Misc:
- A cache miss returns `null` in `A_basic`.
- TTL cleanup is lazy; there is no background cleanup thread.
- Eviction is implemented directly inside the facade using `EvictionType`.
- TTL-aware eviction is an eligibility filter, not earliest-expiry ordering.
- Cache key and value are generic; they are not hardcoded as `String`.
- Metrics, persistence, serialization, distributed behavior, and custom validations are deferred.

#### Common Misc

Offline or Online:
- Treat this as an offline/in-process app or local library.
- The datastore uses in-memory `HashMap`, so data is lost when the process exits.
- No network APIs, replication, consistency model, or distributed node membership is part of `A_basic`.

Extensibility:
- Core entities:
  - `Cache<K, V>` and `CacheEntry<K, V>` are generic so the same model supports user caches, product caches, session caches, and computed-result caches.
  - `CacheConfig` keeps capacity-related behavior configurable without changing the entity shape.
- Behaviour:
  - Eviction is a future Strategy candidate.
  - TTL cleanup can later become scheduled cleanup or a timing-wheel style mechanism.
  - Expiry behavior can later become an expiry policy if rules become more complex.
- Features:
  - Future packages can add metrics, persistence, concurrency, exceptions, listeners, and distributed cache behavior.

Store full history and support undo:
- Not needed for `A_basic`.
- A cache is optimized for fast lookup and replacement, not historical reconstruction.
- If audit history is needed later, it should be a separate event log, not part of `CacheEntry`.

Notification broadcasts:
- Not needed for `A_basic`.
- Later packages can add callbacks or observers for entry added, updated, removed, expired, or evicted events.

Exception Handling:
- Missing cache, invalid capacity, null key, duplicate cache IDs, negative TTL, and unsupported config are later-package validations.
- `A_basic` assumes setup and inputs are valid.
- Cache miss is treated as normal cache behavior and returns `null`.

Edge Cases:
- Duplicate keys, expired entries, full capacity, and repeated reads are part of the basic cache flow.
- Invalid IDs, malformed keys, zero capacity, negative TTL, and null inputs are deferred.

Concurrency and thread-safety:
- Real caches often receive concurrent reads and writes.
- `A_basic` uses `HashMap` and normal lists.
- No locks, synchronized blocks, `ConcurrentHashMap`, atomic counters, or background threads are included.

### UseCase Diagram

Actors:
- User
- Admin
- System

UseCases:
- addCache(Admin) -> create CacheConfig(System) -> create Cache(System) -> putCache(DataStore)
- put(User) -> removeExpiredEntries(System) -> derive entryId(System) -> update existing entry or create new entry(System) -> evictOneEntry if capacity full(System) -> if victim exists putCacheEntry(DataStore) -> add cacheEntryId to Cache(System)
- get(User) -> removeExpiredEntries(System) -> derive entryId(System) -> read CacheEntry(DataStore) -> update access metadata(System) -> refresh expiry if expire-after-access(System) -> return value(User)
- remove(User) -> derive entryId(System) -> remove CacheEntry(DataStore) -> remove cacheEntryId from Cache(System)
- removeExpiredEntries(System) -> scan cacheEntryList(System) -> remove expired entries(DataStore) -> update Cache metadata(System)
- evictOneEntry(System) -> choose victim by EvictionType(System) -> return null if no eligible victim(System) -> remove CacheEntry(DataStore) -> update Cache metadata(System)

### Class Diagram

#### Identifying layers/structure

Main:
- Demo runner.
- Creates `DataStore` and `CacheFacade`.
- Generates direct cache IDs.
- Calls facade methods only.

Facade/service:
- `CacheFacade<K, V>` owns user/admin/system workflows.
- It coordinates `DataStore`, `Cache`, and `CacheEntry`.
- It keeps small eviction and expiry helper logic private or inside system methods.

Core entities/models:
- `Cache<K, V>` stores cache metadata and child entry IDs.
- `CacheEntry<K, V>` stores one key-value pair and metadata for TTL and eviction.
- `CacheConfig` stores default TTL, eviction type, and expiry type.
- `EvictionType` and `ExpiryType` are enums because `A_basic` only needs fixed labels and simple branching.

Datastore:
- `DataStore<K, V>` abstracts in-memory storage.
- `InMemoryDataStore<K, V>` uses `HashMap`.
- Datastore contains only get, put, contains, and remove methods.
- Datastore does not create IDs, validate, evict, expire, or mutate cache behavior.

Strategies/factories/patterns:
- Not implemented in `A_basic`.
- Eviction strategy is introduced in `B_Strategy`.

#### Core entities and relationships

- `Cache<K, V>`:
  - `cacheId`
  - `capacity`
  - `cacheConfig`
  - `cacheEntryList`
- `CacheEntry<K, V>`:
  - `cacheEntryId`
  - `key`
  - `value`
  - `createdAtMillis`
  - `lastAccessedAtMillis`
  - `expiresAtMillis`
  - `ttlMillis`
  - `hasTtl`
  - `createdOrder`
  - `lastAccessedOrder`
  - `accessCount`
- `CacheConfig`:
  - `defaultTtlMillis`
  - `evictionType`
  - `expiryType`

Relationship choices:
- `Cache` stores entry IDs in `cacheEntryList`.
- `CacheEntry` does not store a reverse `cacheId`.
- `CacheEntry` is stored independently because cache entries are independently inserted, read, updated, expired, and evicted.

#### Identify fields and entity modelling based on extensibility

- `Cache<K, V>` is generic because cache implementations should not be limited to string keys and values.
- `CacheEntry<K, V>` is generic for the same reason.
- `CacheConfig` is a simple class because it only stores configuration values in `A_basic`.
- `EvictionType` is an enum in `A_basic`; it becomes Strategy in `B_Strategy`.
- `ExpiryType` is an enum because the basic package only needs `EXPIRE_AFTER_WRITE` and `EXPIRE_AFTER_ACCESS`.

#### Identify methods from use-case diagram and decide placement

- `CacheFacade.put`:
  - Belongs in facade because it coordinates cache lookup, expiry cleanup, capacity handling, entry creation/update, datastore writes, and cache metadata.
- `CacheFacade.get`:
  - Belongs in facade because it derives entry IDs, performs lazy expiry cleanup, updates access metadata, and returns the value.
- `CacheFacade.remove`:
  - Belongs in facade because it keeps entry storage and cache metadata in sync.
- `CacheFacade.removeExpiredEntries`:
  - Belongs in facade as a system method because it coordinates cache metadata and datastore removals.
- `CacheFacade.evictOneEntry`:
  - Belongs in facade in `A_basic` because Strategy is intentionally deferred.
  - Returns `null` when a strict TTL-aware eviction type has no TTL-marked victim.
- `CacheEntry.updateValue`, `recordAccess`, `refreshExpiry`, and `isExpired`:
  - Belong in `CacheEntry` because they only use or mutate fields of one entry.
- `Cache.addCacheEntry` and `removeCacheEntry`:
  - Belong in `Cache` because they only maintain that cache's child entry ID list.

## B_Strategy Design Analysis

### Scope Boundary

- Keep the same offline generic cache model.
- Move eviction selection out of `CacheFacade` into strategy classes.
- Keep eviction metadata inside each strategy so eviction does not scan cache entries.
- Keep TTL cleanup lazy and in-process.
- In the normal `get`/`put` path, check only the touched key for expiry so the strategy package does not scan the whole cache.
- Do not add concurrency, persistence, distributed behavior, observers, custom exceptions, or advanced validation.

### Strategy Extension

Eviction strategies:
- `EvictionPolicy<K, V>` receives cache events: add, access, update, remove, and evict.
- `LRUEvictionPolicy<K, V>` uses `LinkedHashSet` to move accessed entries to the tail and evict the head in O(1).
- `FIFOEvictionPolicy<K, V>` uses `LinkedHashSet` to keep insertion order and evict the head in O(1).
- `LFUEvictionPolicy<K, V>` uses a linked list of frequency buckets plus a map from entry ID to frequency bucket.
- LFU evicts from the head frequency bucket in O(1), and within the same frequency it evicts the oldest entry.
- `TtlAwareEvictionPolicy<K, V>` wraps another eviction policy and forwards only entries whose `hasTtl` flag is true.
- `TtlAwareLRUEvictionPolicy<K, V>`, `TtlAwareLFUEvictionPolicy<K, V>`, and `TtlAwareFIFOEvictionPolicy<K, V>` provide strict TTL-eligible variants of the base policies.
- TTL-aware eviction does not mean earliest-expiry eviction in this module.
- If no TTL-marked entry exists, the TTL-aware policy returns `null` as the victim.

Class changes:
- `CacheConfig<K, V>` stores an `EvictionPolicy<K, V>` instead of `EvictionType`.
- `CacheFacade` notifies the configured policy on every add, get, update, remove, expiry, and eviction.
- `CacheFacade.evictOneEntry` asks the configured policy for the current victim in O(1).
- `CacheFacade.evictOneEntry` returns `null` if the configured policy has no eligible victim.
- `CacheFacade.removeExpiredEntries` remains available as an explicit full cleanup operation, but normal `get` and `put` avoid global scans.
- All core cache entities remain generic.

Why Strategy fits here:
- Eviction algorithms vary independently from cache storage, TTL behavior, and facade APIs.
- New algorithms can be added without changing the facade's branching logic.
- The rest of the cache flow remains the same: remove expired entries first, then evict by configured algorithm when capacity is full.
- TTL-aware strategy variants keep the same algorithm but restrict their tracked candidate set to entries that have TTL set.
