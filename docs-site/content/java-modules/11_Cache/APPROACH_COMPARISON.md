# Approach Comparison

## Existing Packages

`A_basic` demonstrates a simple key-value cache with cache records, put, get, update, and remove.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- A cache has a capacity and cache entries.
- A cache entry stores key and value.

Action based points:
- Admin creates a cache.
- User puts, gets, updates, and removes values.
- System creates a deterministic cache-entry id from cache id and key.

Misc:
- A_basic does not enforce eviction when capacity is full.
- Eviction policy, TTL, metrics, and concurrency are later packages.

#### Common Misc

Offline or online:
- Treat as library/API style with datastore maps for consistency.

Extensibility:
- Eviction policy and expiry can become strategies later.

History and undo:
- Not needed.

Notifications:
- Not needed.

Exception handling:
- Missing keys and capacity overflow are later validations.

Concurrency:
- Concurrent put/get/remove is deferred.

### UseCase Diagram

Actors:
- User
- Admin
- System

UseCases:
- addCache(Admin) -> create Cache(System)
- put(User) -> create or update CacheEntry(System) -> add entry id to Cache(System)
- get(User) -> read CacheEntry(System)
- remove(User) -> remove CacheEntry(System)

### Class Diagram

Core entities:
- `Cache(cacheId, capacity, cacheEntryList)` stores entry IDs.
- `CacheEntry(cacheEntryId, key, value)` stores key-value data.

Method placement:
- Cache operations belong in the facade because they coordinate datastore and cache-entry IDs.
- `updateValue` belongs in `CacheEntry` because it only mutates entry state.
