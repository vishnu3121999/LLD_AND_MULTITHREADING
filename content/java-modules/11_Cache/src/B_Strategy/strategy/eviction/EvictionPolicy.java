package B_Strategy.strategy.eviction;

import B_Strategy.model.CacheEntry;

public interface EvictionPolicy<K, V> {
    void onEntryAdded(CacheEntry<K, V> cacheEntry);

    void onEntryAccessed(CacheEntry<K, V> cacheEntry);

    void onEntryUpdated(CacheEntry<K, V> cacheEntry);

    void onEntryRemoved(String cacheEntryId);

    String evictEntryId();
}
