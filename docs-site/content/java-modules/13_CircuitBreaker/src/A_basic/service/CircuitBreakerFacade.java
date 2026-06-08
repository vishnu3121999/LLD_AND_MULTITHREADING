package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.CircuitBreaker;
import A_basic.model.DownstreamService;
import A_basic.model.enums.BreakerState;

public class CircuitBreakerFacade {
    private final DataStore dataStore;
    public CircuitBreakerFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public String callService(String downstreamServiceId, boolean downstreamSuccess) {
        DownstreamService service = dataStore.getDownstreamService(downstreamServiceId);
        CircuitBreaker breaker = dataStore.getCircuitBreaker(service.getCircuitBreakerId());
        if (breaker.getBreakerState() == BreakerState.OPEN) return "BLOCKED";
        if (downstreamSuccess) { breaker.recordSuccess(); return "SUCCESS"; }
        breaker.recordFailure();
        return "FAILED";
    }

    // System methods

    // Admin methods

    public void addCircuitBreaker(String circuitBreakerId, int failureThreshold) { CircuitBreaker breaker = new CircuitBreaker(circuitBreakerId, failureThreshold); dataStore.putCircuitBreaker(breaker.getCircuitBreakerId(), breaker); }
    public void addDownstreamService(String downstreamServiceId, String name, String circuitBreakerId) { DownstreamService service = new DownstreamService(downstreamServiceId, name, circuitBreakerId); dataStore.putDownstreamService(service.getDownstreamServiceId(), service); }

    // Util/helper methods
}
