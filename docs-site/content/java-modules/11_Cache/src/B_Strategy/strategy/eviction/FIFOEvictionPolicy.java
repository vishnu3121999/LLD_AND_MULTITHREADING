package B_Strategy.strategy.eviction;

import B_Strategy.model.CacheEntry;

import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.Set;

public class FIFOEvictionPolicy<K, V> implements EvictionPolicy<K, V> {
    private final Set<String> cacheEntryOrder;

    public FIFOEvictionPolicy() {
        this.cacheEntryOrder = new LinkedHashSet<>();
    }

    @Override
    public void onEntryAdded(CacheEntry<K, V> cacheEntry) {
        cacheEntryOrder.add(cacheEntry.getCacheEntryId());
    }

    @Override
    public void onEntryAccessed(CacheEntry<K, V> cacheEntry) {
    }

    @Override
    public void onEntryUpdated(CacheEntry<K, V> cacheEntry) {
    }

    @Override
    public void onEntryRemoved(String cacheEntryId) {
        cacheEntryOrder.remove(cacheEntryId);
    }

    @Override
    public String evictEntryId() {
        if (cacheEntryOrder.isEmpty()) {
            return null;
        }
        Iterator<String> iterator = cacheEntryOrder.iterator();
        return iterator.next();
    }
}
