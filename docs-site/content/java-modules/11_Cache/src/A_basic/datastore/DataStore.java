package A_basic.datastore;

        import A_basic.model.Cache;
import A_basic.model.CacheEntry;

        public interface DataStore {

            Cache getCache(String key);

            void putCache(String key, Cache value);

            boolean containsCache(String key);

            Cache removeCache(String key);
            CacheEntry getCacheEntry(String key);

            void putCacheEntry(String key, CacheEntry value);

            boolean containsCacheEntry(String key);

            CacheEntry removeCacheEntry(String key);
        }
