package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.Cache;
import A_basic.model.CacheConfig;
import A_basic.model.CacheEntry;
import A_basic.model.enums.EvictionType;
import A_basic.model.enums.ExpiryType;

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
        removeExpiredEntries(cacheId);
        long nowMillis = System.currentTimeMillis();
        String cacheEntryId = entryId(cacheId, key);
        boolean hasTtl = isTtlSet(ttlMillis);

        if (dataStore.containsCacheEntry(cacheEntryId)) {
            dataStore.getCacheEntry(cacheEntryId).updateValue(value, nowMillis, ttlMillis, hasTtl, nextOperationOrder());
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
    }

    public V get(String cacheId, K key) {
        removeExpiredEntries(cacheId);
        Cache<K, V> cache = dataStore.getCache(cacheId);
        CacheEntry<K, V> cacheEntry = dataStore.getCacheEntry(entryId(cacheId, key));
        if (cacheEntry == null) {
            return null;
        }

        long nowMillis = System.currentTimeMillis();
        cacheEntry.recordAccess(nowMillis, nextOperationOrder());
        if (cache.getCacheConfig().getExpiryType() == ExpiryType.EXPIRE_AFTER_ACCESS) {
            cacheEntry.refreshExpiry(nowMillis);
        }
        return cacheEntry.getValue();
    }

    public void remove(String cacheId, K key) {
        String cacheEntryId = entryId(cacheId, key);
        dataStore.removeCacheEntry(cacheEntryId);
        dataStore.getCache(cacheId).removeCacheEntry(cacheEntryId);
    }

    // System methods

    public void removeExpiredEntries(String cacheId) {
        Cache<K, V> cache = dataStore.getCache(cacheId);
        long nowMillis = System.currentTimeMillis();
        List<String> cacheEntryIdList = new ArrayList<>(cache.getCacheEntryList());

        for (String cacheEntryId : cacheEntryIdList) {
            CacheEntry<K, V> cacheEntry = dataStore.getCacheEntry(cacheEntryId);
            if (cacheEntry != null && cacheEntry.isExpired(nowMillis)) {
                dataStore.removeCacheEntry(cacheEntryId);
                cache.removeCacheEntry(cacheEntryId);
            }
        }
    }

    public String evictOneEntry(String cacheId) {
        Cache<K, V> cache = dataStore.getCache(cacheId);
        String selectedCacheEntryId = selectEntryForEviction(cache);
        if (selectedCacheEntryId == null) {
            return null;
        }
        dataStore.removeCacheEntry(selectedCacheEntryId);
        cache.removeCacheEntry(selectedCacheEntryId);
        return selectedCacheEntryId;
    }

    // Admin methods

    public void addCache(String cacheId, int capacity, CacheConfig cacheConfig) {
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

    private String selectEntryForEviction(Cache<K, V> cache) {
        EvictionType evictionType = cache.getCacheConfig().getEvictionType();
        String selectedCacheEntryId = null;

        for (String cacheEntryId : cache.getCacheEntryList()) {
            CacheEntry<K, V> current = dataStore.getCacheEntry(cacheEntryId);
            if (!isEligibleForEviction(evictionType, current)) {
                continue;
            }

            if (selectedCacheEntryId == null) {
                selectedCacheEntryId = cacheEntryId;
                continue;
            }

            CacheEntry<K, V> selected = dataStore.getCacheEntry(selectedCacheEntryId);
            if (isLruType(evictionType) && current.getLastAccessedOrder() < selected.getLastAccessedOrder()) {
                selectedCacheEntryId = cacheEntryId;
            } else if (isLfuType(evictionType) && isBetterLfuVictim(current, selected)) {
                selectedCacheEntryId = cacheEntryId;
            } else if (isFifoType(evictionType) && current.getCreatedOrder() < selected.getCreatedOrder()) {
                selectedCacheEntryId = cacheEntryId;
            }
        }

        return selectedCacheEntryId;
    }

    private boolean isBetterLfuVictim(CacheEntry<K, V> current, CacheEntry<K, V> selected) {
        if (current.getAccessCount() < selected.getAccessCount()) {
            return true;
        }
        return current.getAccessCount() == selected.getAccessCount()
                && current.getLastAccessedOrder() < selected.getLastAccessedOrder();
    }

    private boolean isEligibleForEviction(EvictionType evictionType, CacheEntry<K, V> cacheEntry) {
        return !isTtlAwareType(evictionType) || cacheEntry.hasTtl();
    }

    private boolean isTtlAwareType(EvictionType evictionType) {
        return evictionType == EvictionType.TTL_AWARE_LRU
                || evictionType == EvictionType.TTL_AWARE_LFU
                || evictionType == EvictionType.TTL_AWARE_FIFO;
    }

    private boolean isLruType(EvictionType evictionType) {
        return evictionType == EvictionType.LRU || evictionType == EvictionType.TTL_AWARE_LRU;
    }

    private boolean isLfuType(EvictionType evictionType) {
        return evictionType == EvictionType.LFU || evictionType == EvictionType.TTL_AWARE_LFU;
    }

    private boolean isFifoType(EvictionType evictionType) {
        return evictionType == EvictionType.FIFO || evictionType == EvictionType.TTL_AWARE_FIFO;
    }
}
