package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.service.CircuitBreakerFacade;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Circuit Breaker Basic Demo ===");
        DataStore dataStore = new InMemoryDataStore();
        CircuitBreakerFacade facade = new CircuitBreakerFacade(dataStore);
        String breakerId = id("breaker");
        String serviceId = id("service");
        facade.addCircuitBreaker(breakerId, 2);
        facade.addDownstreamService(serviceId, "Payment API", breakerId);
        System.out.println(facade.callService(serviceId, false));
        System.out.println(facade.callService(serviceId, false));
        System.out.println(facade.callService(serviceId, true));
        System.out.println(dataStore.getCircuitBreaker(breakerId));
    }
    private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); }
}
