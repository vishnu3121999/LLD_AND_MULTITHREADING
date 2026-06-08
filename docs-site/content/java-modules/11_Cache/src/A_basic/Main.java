package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.service.CacheFacade;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Cache Basic Demo ===");
        DataStore dataStore = new InMemoryDataStore();
        CacheFacade facade = new CacheFacade(dataStore);
        String cacheId = id("cache");
        facade.addCache(cacheId, 3);
        facade.put(cacheId, "user:1", "Asha");
        facade.put(cacheId, "user:2", "Ravi");
        facade.put(cacheId, "user:1", "Asha Updated");
        System.out.println(facade.get(cacheId, "user:1"));
        System.out.println(dataStore.getCache(cacheId));
    }
    private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); }
}
