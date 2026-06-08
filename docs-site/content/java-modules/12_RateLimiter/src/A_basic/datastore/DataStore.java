package A_basic.datastore;

        import A_basic.model.Client;
import A_basic.model.RateLimitRule;
import A_basic.model.RateLimitBucket;

        public interface DataStore {

            Client getClient(String key);

            void putClient(String key, Client value);

            boolean containsClient(String key);

            Client removeClient(String key);
            RateLimitRule getRateLimitRule(String key);

            void putRateLimitRule(String key, RateLimitRule value);

            boolean containsRateLimitRule(String key);

            RateLimitRule removeRateLimitRule(String key);
            RateLimitBucket getRateLimitBucket(String key);

            void putRateLimitBucket(String key, RateLimitBucket value);

            boolean containsRateLimitBucket(String key);

            RateLimitBucket removeRateLimitBucket(String key);
        }
