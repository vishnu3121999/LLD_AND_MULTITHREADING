package B_Strategy.datastore;

import B_Strategy.model.Cache;
import B_Strategy.model.CacheEntry;

public interface DataStore<K, V> {

    Cache<K, V> getCache(String key);

    void putCache(String key, Cache<K, V> value);

    boolean containsCache(String key);

    Cache<K, V> removeCache(String key);

    CacheEntry<K, V> getCacheEntry(String key);

    void putCacheEntry(String key, CacheEntry<K, V> value);

    boolean containsCacheEntry(String key);

    CacheEntry<K, V> removeCacheEntry(String key);
}
