package B_Strategy.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Cache<K, V> {
    private final String cacheId;
    private final int capacity;
    private final CacheConfig<K, V> cacheConfig;
    private final List<String> cacheEntryList;

    public Cache(String cacheId, int capacity, CacheConfig<K, V> cacheConfig) {
        this.cacheId = cacheId;
        this.capacity = capacity;
        this.cacheConfig = cacheConfig;
        this.cacheEntryList = new ArrayList<>();
    }

    public void addCacheEntry(String cacheEntryId) {
        cacheEntryList.add(cacheEntryId);
    }

    public void removeCacheEntry(String cacheEntryId) {
        cacheEntryList.remove(cacheEntryId);
    }

    @Override
    public String toString() {
        return "Cache{" +
                "cacheId='" + cacheId + '\'' +
                ", capacity=" + capacity +
                ", cacheConfig=" + cacheConfig +
                ", cacheEntryList=" + cacheEntryList +
                '}';
    }

    public String getCacheId() { return cacheId; }
    public int getCapacity() { return capacity; }
    public CacheConfig<K, V> getCacheConfig() { return cacheConfig; }
    public List<String> getCacheEntryList() { return Collections.unmodifiableList(cacheEntryList); }
}
