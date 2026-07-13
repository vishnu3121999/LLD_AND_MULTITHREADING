package A_basic.datastore;

        import A_basic.model.DownstreamService;
import A_basic.model.CircuitBreaker;

        import java.util.HashMap;
        import java.util.Map;

        public class InMemoryDataStore implements DataStore {
            private final Map<String, DownstreamService> downstreamServiceMap;
    private final Map<String, CircuitBreaker> circuitBreakerMap;

            public InMemoryDataStore() {
                this.downstreamServiceMap = new HashMap<>();
        this.circuitBreakerMap = new HashMap<>();
            }


            @Override
            public DownstreamService getDownstreamService(String key) {
                return downstreamServiceMap.get(key);
            }

            @Override
            public void putDownstreamService(String key, DownstreamService value) {
                downstreamServiceMap.put(key, value);
            }

            @Override
            public boolean containsDownstreamService(String key) {
                return downstreamServiceMap.containsKey(key);
            }

            @Override
            public DownstreamService removeDownstreamService(String key) {
                return downstreamServiceMap.remove(key);
            }
            @Override
            public CircuitBreaker getCircuitBreaker(String key) {
                return circuitBreakerMap.get(key);
            }

            @Override
            public void putCircuitBreaker(String key, CircuitBreaker value) {
                circuitBreakerMap.put(key, value);
            }

            @Override
            public boolean containsCircuitBreaker(String key) {
                return circuitBreakerMap.containsKey(key);
            }

            @Override
            public CircuitBreaker removeCircuitBreaker(String key) {
                return circuitBreakerMap.remove(key);
            }
        }
