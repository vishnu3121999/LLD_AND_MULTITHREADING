package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.model.RateLimitDecision;
import A_basic.model.enums.HttpMethod;
import A_basic.model.enums.RateLimitAlgorithm;
import A_basic.service.RateLimiterFacade;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Rate Limiter Basic Demo ===");

        DataStore dataStore = new InMemoryDataStore();
        RateLimiterFacade facade = new RateLimiterFacade(dataStore);

        String loginEndpointId = id("endpoint");
        String searchEndpointId = id("endpoint");
        String basicPlanId = id("plan");
        String loginRuleId = id("rule");
        String searchRuleId = id("rule");
        String clientId = id("client");

        facade.addApiEndpoint(loginEndpointId, "/api/login", HttpMethod.POST);
        facade.addApiEndpoint(searchEndpointId, "/api/search", HttpMethod.GET);

        facade.addRateLimitPlan(basicPlanId, "Basic API Plan");
        facade.addRateLimitRule(basicPlanId, loginRuleId, loginEndpointId, RateLimitAlgorithm.FIXED_WINDOW, 3, 1000);
        facade.addRateLimitRule(basicPlanId, searchRuleId, searchEndpointId, RateLimitAlgorithm.FIXED_WINDOW, 2, 1000);

        facade.addClient(clientId, "mobile-app", basicPlanId);

        printDecision("login request 1", facade.allowRequest(clientId, loginEndpointId, 100));
        printDecision("login request 2", facade.allowRequest(clientId, loginEndpointId, 200));
        printDecision("login request 3", facade.allowRequest(clientId, loginEndpointId, 300));
        printDecision("login request 4", facade.allowRequest(clientId, loginEndpointId, 400));
        printDecision("login request after window reset", facade.allowRequest(clientId, loginEndpointId, 1200));

        printDecision("search request 1", facade.allowRequest(clientId, searchEndpointId, 1300));
        printDecision("search request 2", facade.allowRequest(clientId, searchEndpointId, 1400));
        printDecision("search request 3", facade.allowRequest(clientId, searchEndpointId, 1500));
    }

    private static void printDecision(String label, RateLimitDecision decision) {
        System.out.println(label + " -> " + decision);
    }

    private static String id(String prefix) {
        return prefix + "-" + UUID.randomUUID();
    }
}
