package A_basic.datastore;

        import A_basic.model.Cache;
import A_basic.model.CacheEntry;

        import java.util.HashMap;
        import java.util.Map;

        public class InMemoryDataStore implements DataStore {
            private final Map<String, Cache> cacheMap;
    private final Map<String, CacheEntry> cacheEntryMap;

            public InMemoryDataStore() {
                this.cacheMap = new HashMap<>();
        this.cacheEntryMap = new HashMap<>();
            }


            @Override
            public Cache getCache(String key) {
                return cacheMap.get(key);
            }

            @Override
            public void putCache(String key, Cache value) {
                cacheMap.put(key, value);
            }

            @Override
            public boolean containsCache(String key) {
                return cacheMap.containsKey(key);
            }

            @Override
            public Cache removeCache(String key) {
                return cacheMap.remove(key);
            }
            @Override
            public CacheEntry getCacheEntry(String key) {
                return cacheEntryMap.get(key);
            }

            @Override
            public void putCacheEntry(String key, CacheEntry value) {
                cacheEntryMap.put(key, value);
            }

            @Override
            public boolean containsCacheEntry(String key) {
                return cacheEntryMap.containsKey(key);
            }

            @Override
            public CacheEntry removeCacheEntry(String key) {
                return cacheEntryMap.remove(key);
            }
        }
