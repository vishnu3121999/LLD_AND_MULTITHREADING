package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.model.CacheConfig;
import A_basic.model.enums.EvictionType;
import A_basic.model.enums.ExpiryType;
import A_basic.service.CacheFacade;

import java.util.UUID;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Cache Basic Demo ===");
        DataStore<String, String> dataStore = new InMemoryDataStore<>();
        CacheFacade<String, String> facade = new CacheFacade<>(dataStore);

        String cacheId = id("cache");
        CacheConfig cacheConfig = new CacheConfig(5_000, EvictionType.LRU, ExpiryType.EXPIRE_AFTER_WRITE);
        facade.addCache(cacheId, 2, cacheConfig);

        facade.put(cacheId, "user:1", "Asha");
        facade.put(cacheId, "user:2", "Ravi");
        System.out.println("Read user:1 = " + facade.get(cacheId, "user:1"));

        facade.put(cacheId, "user:3", "Meera");
        System.out.println(facade.get(cacheId, "user:1"));
        System.out.println("Evicted user:2 = " + facade.get(cacheId, "user:2"));
        System.out.println("Read user:3 = " + facade.get(cacheId, "user:3"));

        facade.put(cacheId, "session:short", "temporary", 1);
        Thread.sleep(5);
        System.out.println("Expired session = " + facade.get(cacheId, "session:short"));
        System.out.println(dataStore.getCache(cacheId));

        String ttlAwareCacheId = id("ttl-aware-cache");
        CacheConfig ttlAwareCacheConfig = new CacheConfig(0, EvictionType.TTL_AWARE_LRU, ExpiryType.EXPIRE_AFTER_WRITE);
        facade.addCache(ttlAwareCacheId, 2, ttlAwareCacheConfig);
        facade.put(ttlAwareCacheId, "permanent", "kept");
        facade.put(ttlAwareCacheId, "temporary", "evicted", 5_000);
        facade.put(ttlAwareCacheId, "new", "fresh");
        System.out.println("TTL-aware evicted temporary = " + facade.get(ttlAwareCacheId, "temporary"));
        System.out.println("TTL-aware kept permanent = " + facade.get(ttlAwareCacheId, "permanent"));

        String noVictimCacheId = id("no-victim-cache");
        facade.addCache(noVictimCacheId, 1, ttlAwareCacheConfig);
        facade.put(noVictimCacheId, "permanent", "kept");
        System.out.println("No TTL victim = " + facade.evictOneEntry(noVictimCacheId));
        facade.put(noVictimCacheId, "new", "not inserted");
        System.out.println("No-victim insert result = " + facade.get(noVictimCacheId, "new"));
    }

    private static String id(String prefix) {
        return prefix + "-" + UUID.randomUUID();
    }
}
