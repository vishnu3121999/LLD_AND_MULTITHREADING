package A_basic.datastore;

        import A_basic.model.DownstreamService;
import A_basic.model.CircuitBreaker;

        public interface DataStore {

            DownstreamService getDownstreamService(String key);

            void putDownstreamService(String key, DownstreamService value);

            boolean containsDownstreamService(String key);

            DownstreamService removeDownstreamService(String key);
            CircuitBreaker getCircuitBreaker(String key);

            void putCircuitBreaker(String key, CircuitBreaker value);

            boolean containsCircuitBreaker(String key);

            CircuitBreaker removeCircuitBreaker(String key);
        }
