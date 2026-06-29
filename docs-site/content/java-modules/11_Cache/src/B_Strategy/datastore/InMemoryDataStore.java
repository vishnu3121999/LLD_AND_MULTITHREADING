package B_Strategy.datastore;

import B_Strategy.model.Cache;
import B_Strategy.model.CacheEntry;

import java.util.HashMap;
import java.util.Map;

public class InMemoryDataStore<K, V> implements DataStore<K, V> {
    private final Map<String, Cache<K, V>> cacheMap;
    private final Map<String, CacheEntry<K, V>> cacheEntryMap;

    public InMemoryDataStore() {
        this.cacheMap = new HashMap<>();
        this.cacheEntryMap = new HashMap<>();
    }

    @Override
    public Cache<K, V> getCache(String key) {
        return cacheMap.get(key);
    }

    @Override
    public void putCache(String key, Cache<K, V> value) {
        cacheMap.put(key, value);
    }

    @Override
    public boolean containsCache(String key) {
        return cacheMap.containsKey(key);
    }

    @Override
    public Cache<K, V> removeCache(String key) {
        return cacheMap.remove(key);
    }

    @Override
    public CacheEntry<K, V> getCacheEntry(String key) {
        return cacheEntryMap.get(key);
    }

    @Override
    public void putCacheEntry(String key, CacheEntry<K, V> value) {
        cacheEntryMap.put(key, value);
    }

    @Override
    public boolean containsCacheEntry(String key) {
        return cacheEntryMap.containsKey(key);
    }

    @Override
    public CacheEntry<K, V> removeCacheEntry(String key) {
        return cacheEntryMap.remove(key);
    }
}
