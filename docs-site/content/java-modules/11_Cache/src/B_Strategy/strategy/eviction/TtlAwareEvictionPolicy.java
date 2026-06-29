package B_Strategy.strategy.eviction;

import B_Strategy.model.CacheEntry;

import java.util.HashSet;
import java.util.Set;

public class TtlAwareEvictionPolicy<K, V> implements EvictionPolicy<K, V> {
    private final EvictionPolicy<K, V> evictionPolicy;
    private final Set<String> ttlEntrySet;

    public TtlAwareEvictionPolicy(EvictionPolicy<K, V> evictionPolicy) {
        this.evictionPolicy = evictionPolicy;
        this.ttlEntrySet = new HashSet<>();
    }

    @Override
    public void onEntryAdded(CacheEntry<K, V> cacheEntry) {
        if (cacheEntry.hasTtl()) {
            ttlEntrySet.add(cacheEntry.getCacheEntryId());
            evictionPolicy.onEntryAdded(cacheEntry);
        }
    }

    @Override
    public void onEntryAccessed(CacheEntry<K, V> cacheEntry) {
        if (ttlEntrySet.contains(cacheEntry.getCacheEntryId())) {
            evictionPolicy.onEntryAccessed(cacheEntry);
        }
    }

    @Override
    public void onEntryUpdated(CacheEntry<K, V> cacheEntry) {
        if (cacheEntry.hasTtl() && ttlEntrySet.contains(cacheEntry.getCacheEntryId())) {
            evictionPolicy.onEntryUpdated(cacheEntry);
        } else if (cacheEntry.hasTtl()) {
            ttlEntrySet.add(cacheEntry.getCacheEntryId());
            evictionPolicy.onEntryAdded(cacheEntry);
        } else if (ttlEntrySet.remove(cacheEntry.getCacheEntryId())) {
            evictionPolicy.onEntryRemoved(cacheEntry.getCacheEntryId());
        }
    }

    @Override
    public void onEntryRemoved(String cacheEntryId) {
        if (ttlEntrySet.remove(cacheEntryId)) {
            evictionPolicy.onEntryRemoved(cacheEntryId);
        }
    }

    @Override
    public String evictEntryId() {
        return evictionPolicy.evictEntryId();
    }
}
