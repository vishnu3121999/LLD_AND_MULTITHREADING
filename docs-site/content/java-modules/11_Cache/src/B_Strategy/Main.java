package B_Strategy;

import B_Strategy.datastore.DataStore;
import B_Strategy.datastore.InMemoryDataStore;
import B_Strategy.model.CacheConfig;
import B_Strategy.model.enums.ExpiryType;
import B_Strategy.service.CacheFacade;
import B_Strategy.strategy.eviction.FIFOEvictionPolicy;
import B_Strategy.strategy.eviction.LFUEvictionPolicy;
import B_Strategy.strategy.eviction.LRUEvictionPolicy;
import B_Strategy.strategy.eviction.TtlAwareLRUEvictionPolicy;

import java.util.UUID;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Cache Strategy Demo ===");
        DataStore<String, String> dataStore = new InMemoryDataStore<>();
        CacheFacade<String, String> facade = new CacheFacade<>(dataStore);

        String lruCacheId = id("lru-cache");
        facade.addCache(lruCacheId, 2, new CacheConfig<>(5_000, ExpiryType.EXPIRE_AFTER_WRITE, new LRUEvictionPolicy<>()));
        facade.put(lruCacheId, "user:1", "Asha");
        facade.put(lruCacheId, "user:2", "Ravi");
        facade.get(lruCacheId, "user:1");
        facade.put(lruCacheId, "user:3", "Meera");
        System.out.println("LRU evicted user:2 = " + facade.get(lruCacheId, "user:2"));

        String lfuCacheId = id("lfu-cache");
        facade.addCache(lfuCacheId, 2, new CacheConfig<>(5_000, ExpiryType.EXPIRE_AFTER_WRITE, new LFUEvictionPolicy<>()));
        facade.put(lfuCacheId, "product:1", "Keyboard");
        facade.put(lfuCacheId, "product:2", "Mouse");
        facade.get(lfuCacheId, "product:1");
        facade.get(lfuCacheId, "product:1");
        facade.put(lfuCacheId, "product:3", "Monitor");
        System.out.println("LFU evicted product:2 = " + facade.get(lfuCacheId, "product:2"));

        String fifoCacheId = id("fifo-cache");
        facade.addCache(fifoCacheId, 2, new CacheConfig<>(5_000, ExpiryType.EXPIRE_AFTER_WRITE, new FIFOEvictionPolicy<>()));
        facade.put(fifoCacheId, "page:1", "Home");
        facade.put(fifoCacheId, "page:2", "Search");
        facade.get(fifoCacheId, "page:1");
        facade.put(fifoCacheId, "page:3", "Checkout");
        System.out.println("FIFO evicted page:1 = " + facade.get(fifoCacheId, "page:1"));

        String ttlAwareCacheId = id("ttl-aware-cache");
        facade.addCache(ttlAwareCacheId, 2, new CacheConfig<>(0, ExpiryType.EXPIRE_AFTER_WRITE, new TtlAwareLRUEvictionPolicy<>()));
        facade.put(ttlAwareCacheId, "permanent", "kept");
        facade.put(ttlAwareCacheId, "temporary", "evicted", 5_000);
        facade.put(ttlAwareCacheId, "new", "fresh");
        System.out.println("TTL-aware LRU evicted temporary = " + facade.get(ttlAwareCacheId, "temporary"));
        System.out.println("TTL-aware LRU kept permanent = " + facade.get(ttlAwareCacheId, "permanent"));
    }

    private static String id(String prefix) {
        return prefix + "-" + UUID.randomUUID();
    }
}
