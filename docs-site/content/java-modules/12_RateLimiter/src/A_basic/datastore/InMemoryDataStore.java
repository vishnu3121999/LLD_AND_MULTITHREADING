package A_basic.datastore;

import A_basic.model.ApiEndpoint;
import A_basic.model.Client;
import A_basic.model.RateLimitBucket;
import A_basic.model.RateLimitPlan;
import A_basic.model.RateLimitRule;

import java.util.HashMap;
import java.util.Map;

public class InMemoryDataStore implements DataStore {
    private final Map<String, Client> clientMap;
    private final Map<String, ApiEndpoint> apiEndpointMap;
    private final Map<String, RateLimitPlan> rateLimitPlanMap;
    private final Map<String, RateLimitRule> rateLimitRuleMap;
    private final Map<String, RateLimitBucket> rateLimitBucketMap;

    public InMemoryDataStore() {
        this.clientMap = new HashMap<>();
        this.apiEndpointMap = new HashMap<>();
        this.rateLimitPlanMap = new HashMap<>();
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
    public ApiEndpoint getApiEndpoint(String key) {
        return apiEndpointMap.get(key);
    }

    @Override
    public void putApiEndpoint(String key, ApiEndpoint value) {
        apiEndpointMap.put(key, value);
    }

    @Override
    public boolean containsApiEndpoint(String key) {
        return apiEndpointMap.containsKey(key);
    }

    @Override
    public ApiEndpoint removeApiEndpoint(String key) {
        return apiEndpointMap.remove(key);
    }

    @Override
    public RateLimitPlan getRateLimitPlan(String key) {
        return rateLimitPlanMap.get(key);
    }

    @Override
    public void putRateLimitPlan(String key, RateLimitPlan value) {
        rateLimitPlanMap.put(key, value);
    }

    @Override
    public boolean containsRateLimitPlan(String key) {
        return rateLimitPlanMap.containsKey(key);
    }

    @Override
    public RateLimitPlan removeRateLimitPlan(String key) {
        return rateLimitPlanMap.remove(key);
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
