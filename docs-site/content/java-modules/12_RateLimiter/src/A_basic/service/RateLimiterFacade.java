package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.Client;
import A_basic.model.RateLimitBucket;
import A_basic.model.RateLimitRule;

public class RateLimiterFacade {
    private final DataStore dataStore;
    public RateLimiterFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public boolean allowRequest(String clientId, long nowMillis) {
        Client client = dataStore.getClient(clientId);
        RateLimitRule rule = dataStore.getRateLimitRule(client.getRateLimitRuleId());
        RateLimitBucket bucket = getOrCreateBucket(clientId, nowMillis);
        if (nowMillis - bucket.getWindowStartMillis() >= rule.getWindowMillis()) bucket.reset(nowMillis);
        if (bucket.getRequestCount() < rule.getMaxRequests()) { bucket.increment(); return true; }
        return false;
    }

    // System methods

    public RateLimitBucket getOrCreateBucket(String clientId, long nowMillis) {
        String bucketId = "bucket-" + clientId;
        if (!dataStore.containsRateLimitBucket(bucketId)) dataStore.putRateLimitBucket(bucketId, new RateLimitBucket(bucketId, nowMillis));
        return dataStore.getRateLimitBucket(bucketId);
    }

    // Admin methods

    public void addRateLimitRule(String rateLimitRuleId, int maxRequests, long windowMillis) { RateLimitRule rule = new RateLimitRule(rateLimitRuleId, maxRequests, windowMillis); dataStore.putRateLimitRule(rule.getRateLimitRuleId(), rule); }
    public void addClient(String clientId, String name, String rateLimitRuleId) { Client client = new Client(clientId, name, rateLimitRuleId); dataStore.putClient(client.getClientId(), client); }

    // Util/helper methods
}
