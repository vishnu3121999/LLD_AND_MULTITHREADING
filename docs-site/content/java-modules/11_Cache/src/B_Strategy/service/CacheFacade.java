package B_Strategy.service;

import B_Strategy.datastore.DataStore;
import B_Strategy.model.Cache;
import B_Strategy.model.CacheConfig;
import B_Strategy.model.CacheEntry;
import B_Strategy.model.enums.ExpiryType;

import java.util.ArrayList;
import java.util.List;

public class CacheFacade<K, V> {
    private final DataStore<K, V> dataStore;
    private long operationSequence;

    public CacheFacade(DataStore<K, V> dataStore) {
        this.dataStore = dataStore;
        this.operationSequence = 0;
    }

    // User methods

    public void put(String cacheId, K key, V value) {
        Cache<K, V> cache = dataStore.getCache(cacheId);
        put(cacheId, key, value, cache.getCacheConfig().getDefaultTtlMillis());
    }

    public void put(String cacheId, K key, V value, long ttlMillis) {
        Cache<K, V> cache = dataStore.getCache(cacheId);
        long nowMillis = System.currentTimeMillis();
        String cacheEntryId = entryId(cacheId, key);
        CacheEntry<K, V> existingCacheEntry = dataStore.getCacheEntry(cacheEntryId);
        boolean hasTtl = isTtlSet(ttlMillis);

        if (existingCacheEntry != null && existingCacheEntry.isExpired(nowMillis)) {
            removeCacheEntry(cache, cacheEntryId);
            existingCacheEntry = null;
        }

        if (existingCacheEntry != null) {
            existingCacheEntry.updateValue(value, nowMillis, ttlMillis, hasTtl, nextOperationOrder());
            cache.getCacheConfig().getEvictionPolicy().onEntryUpdated(existingCacheEntry);
            return;
        }

        if (cache.getCacheEntryList().size() >= cache.getCapacity()) {
            String evictedCacheEntryId = evictOneEntry(cacheId);
            if (evictedCacheEntryId == null) {
                return;
            }
        }

        CacheEntry<K, V> cacheEntry = new CacheEntry<>(cacheEntryId, key, value, nowMillis, ttlMillis, hasTtl, nextOperationOrder());
        dataStore.putCacheEntry(cacheEntry.getCacheEntryId(), cacheEntry);
        cache.addCacheEntry(cacheEntryId);
        cache.getCacheConfig().getEvictionPolicy().onEntryAdded(cacheEntry);
    }

    public V get(String cacheId, K key) {
        Cache<K, V> cache = dataStore.getCache(cacheId);
        CacheEntry<K, V> cacheEntry = dataStore.getCacheEntry(entryId(cacheId, key));
        if (cacheEntry == null) {
            return null;
        }

        long nowMillis = System.currentTimeMillis();
        if (cacheEntry.isExpired(nowMillis)) {
            removeCacheEntry(cache, cacheEntry.getCacheEntryId());
            return null;
        }

        cacheEntry.recordAccess(nowMillis, nextOperationOrder());
        if (cache.getCacheConfig().getExpiryType() == ExpiryType.EXPIRE_AFTER_ACCESS) {
            cacheEntry.refreshExpiry(nowMillis);
        }
        cache.getCacheConfig().getEvictionPolicy().onEntryAccessed(cacheEntry);
        return cacheEntry.getValue();
    }

    public void remove(String cacheId, K key) {
        Cache<K, V> cache = dataStore.getCache(cacheId);
        String cacheEntryId = entryId(cacheId, key);
        removeCacheEntry(cache, cacheEntryId);
    }

    // System methods

    public void removeExpiredEntries(String cacheId) {
        Cache<K, V> cache = dataStore.getCache(cacheId);
        long nowMillis = System.currentTimeMillis();
        List<String> cacheEntryIdList = new ArrayList<>(cache.getCacheEntryList());

        for (String cacheEntryId : cacheEntryIdList) {
            CacheEntry<K, V> cacheEntry = dataStore.getCacheEntry(cacheEntryId);
            if (cacheEntry != null && cacheEntry.isExpired(nowMillis)) {
                removeCacheEntry(cache, cacheEntryId);
            }
        }
    }

    public String evictOneEntry(String cacheId) {
        Cache<K, V> cache = dataStore.getCache(cacheId);
        String selectedCacheEntryId = cache.getCacheConfig().getEvictionPolicy().evictEntryId();
        if (selectedCacheEntryId == null) {
            return null;
        }
        removeCacheEntry(cache, selectedCacheEntryId);
        return selectedCacheEntryId;
    }

    // Admin methods

    public void addCache(String cacheId, int capacity, CacheConfig<K, V> cacheConfig) {
        Cache<K, V> cache = new Cache<>(cacheId, capacity, cacheConfig);
        dataStore.putCache(cache.getCacheId(), cache);
    }

    // Util/helper methods

    private String entryId(String cacheId, K key) {
        return cacheId + "::" + key;
    }

    private long nextOperationOrder() {
        operationSequence++;
        return operationSequence;
    }

    private boolean isTtlSet(long ttlMillis) {
        return ttlMillis > 0;
    }

    private void removeCacheEntry(Cache<K, V> cache, String cacheEntryId) {
        if (cacheEntryId == null) {
            return;
        }
        dataStore.removeCacheEntry(cacheEntryId);
        cache.removeCacheEntry(cacheEntryId);
        cache.getCacheConfig().getEvictionPolicy().onEntryRemoved(cacheEntryId);
    }
}
