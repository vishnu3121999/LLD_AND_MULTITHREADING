package A_basic.datastore;

        import A_basic.model.Client;
import A_basic.model.RateLimitRule;
import A_basic.model.RateLimitBucket;

        import java.util.HashMap;
        import java.util.Map;

        public class InMemoryDataStore implements DataStore {
            private final Map<String, Client> clientMap;
    private final Map<String, RateLimitRule> rateLimitRuleMap;
    private final Map<String, RateLimitBucket> rateLimitBucketMap;

            public InMemoryDataStore() {
                this.clientMap = new HashMap<>();
        this.rateLimitRuleMap = new HashMap<>();
        this.rateLimitBucketMap = new HashMap<>();
            }


            @Override
            public Client getClient(String key) {
                return clientMap.get(key);
            }

            @Override
            public void putClient(String key, Client value) {
                clientMap.put(key, value);
            }

            @Override
            public boolean containsClient(String key) {
                return clientMap.containsKey(key);
            }

            @Override
            public Client removeClient(String key) {
                return clientMap.remove(key);
            }
            @Override
            public RateLimitRule getRateLimitRule(String key) {
                return rateLimitRuleMap.get(key);
            }

            @Override
            public void putRateLimitRule(String key, RateLimitRule value) {
                rateLimitRuleMap.put(key, value);
            }

            @Override
            public boolean containsRateLimitRule(String key) {
                return rateLimitRuleMap.containsKey(key);
            }

            @Override
            public RateLimitRule removeRateLimitRule(String key) {
                return rateLimitRuleMap.remove(key);
            }
            @Override
            public RateLimitBucket getRateLimitBucket(String key) {
                return rateLimitBucketMap.get(key);
            }

            @Override
            public void putRateLimitBucket(String key, RateLimitBucket value) {
                rateLimitBucketMap.put(key, value);
            }

            @Override
            public boolean containsRateLimitBucket(String key) {
                return rateLimitBucketMap.containsKey(key);
            }

            @Override
            public RateLimitBucket removeRateLimitBucket(String key) {
                return rateLimitBucketMap.remove(key);
            }
        }
