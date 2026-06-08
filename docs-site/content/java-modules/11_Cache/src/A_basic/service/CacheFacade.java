package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.Cache;
import A_basic.model.CacheEntry;

public class CacheFacade {
    private final DataStore dataStore;
    public CacheFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public void put(String cacheId, String key, String value) {
        String cacheEntryId = entryId(cacheId, key);
        if (dataStore.containsCacheEntry(cacheEntryId)) {
            dataStore.getCacheEntry(cacheEntryId).updateValue(value);
            return;
        }
        CacheEntry cacheEntry = new CacheEntry(cacheEntryId, key, value);
        dataStore.putCacheEntry(cacheEntry.getCacheEntryId(), cacheEntry);
        dataStore.getCache(cacheId).addCacheEntry(cacheEntryId);
    }

    public String get(String cacheId, String key) { return dataStore.getCacheEntry(entryId(cacheId, key)).getValue(); }
    public void remove(String cacheId, String key) { dataStore.removeCacheEntry(entryId(cacheId, key)); }

    // System methods

    // Admin methods

    public void addCache(String cacheId, int capacity) { Cache cache = new Cache(cacheId, capacity); dataStore.putCache(cache.getCacheId(), cache); }

    // Util/helper methods

    private String entryId(String cacheId, String key) { return cacheId + "::" + key; }
}
