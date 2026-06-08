package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.service.RateLimiterFacade;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Rate Limiter Basic Demo ===");
        DataStore dataStore = new InMemoryDataStore();
        RateLimiterFacade facade = new RateLimiterFacade(dataStore);
        String ruleId = id("rule");
        String clientId = id("client");
        facade.addRateLimitRule(ruleId, 2, 1000);
        facade.addClient(clientId, "mobile-app", ruleId);
        System.out.println(facade.allowRequest(clientId, 100));
        System.out.println(facade.allowRequest(clientId, 200));
        System.out.println(facade.allowRequest(clientId, 300));
        System.out.println(facade.allowRequest(clientId, 1200));
    }
    private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); }
}
