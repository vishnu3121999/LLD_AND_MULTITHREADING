package A_basic.datastore;

import A_basic.model.ApiEndpoint;
import A_basic.model.Client;
import A_basic.model.RateLimitBucket;
import A_basic.model.RateLimitPlan;
import A_basic.model.RateLimitRule;

public interface DataStore {

    Client getClient(String key);

    void putClient(String key, Client value);

    boolean containsClient(String key);

    Client removeClient(String key);

    ApiEndpoint getApiEndpoint(String key);

    void putApiEndpoint(String key, ApiEndpoint value);

    boolean containsApiEndpoint(String key);

    ApiEndpoint removeApiEndpoint(String key);

    RateLimitPlan getRateLimitPlan(String key);

    void putRateLimitPlan(String key, RateLimitPlan value);

    boolean containsRateLimitPlan(String key);

    RateLimitPlan removeRateLimitPlan(String key);

    RateLimitRule getRateLimitRule(String key);

    void putRateLimitRule(String key, RateLimitRule value);

    boolean containsRateLimitRule(String key);

    RateLimitRule removeRateLimitRule(String key);

    RateLimitBucket getRateLimitBucket(String key);

    void putRateLimitBucket(String key, RateLimitBucket value);

    boolean containsRateLimitBucket(String key);

    RateLimitBucket removeRateLimitBucket(String key);
}
