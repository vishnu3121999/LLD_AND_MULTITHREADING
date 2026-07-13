package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.ApiEndpoint;
import A_basic.model.Client;
import A_basic.model.RateLimitBucket;
import A_basic.model.RateLimitDecision;
import A_basic.model.RateLimitPlan;
import A_basic.model.RateLimitRule;
import A_basic.model.enums.HttpMethod;
import A_basic.model.enums.RateLimitAlgorithm;
import A_basic.model.enums.RateLimitStatus;

public class RateLimiterFacade {
    private final DataStore dataStore;

    public RateLimiterFacade(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    // User methods

    public RateLimitDecision allowRequest(String clientId, String apiEndpointId, long nowMillis) {
        Client client = dataStore.getClient(clientId);
        RateLimitPlan plan = dataStore.getRateLimitPlan(client.getRateLimitPlanId());
        RateLimitRule rule = findRuleForEndpoint(plan, apiEndpointId);
        RateLimitBucket bucket = getOrCreateBucket(clientId, rule.getRateLimitRuleId(), nowMillis);

        resetWindowIfExpired(bucket, rule, nowMillis);

        if (bucket.getRequestCount() < rule.getMaxRequests()) {
            bucket.increment();
            return new RateLimitDecision(
                    clientId,
                    apiEndpointId,
                    RateLimitStatus.ALLOWED,
                    bucket.getRemainingRequests(rule.getMaxRequests()),
                    0,
                    nowMillis
            );
        }

        return new RateLimitDecision(
                clientId,
                apiEndpointId,
                RateLimitStatus.BLOCKED,
                0,
                retryAfterMillis(bucket, rule, nowMillis),
                nowMillis
        );
    }

    // System methods

    public RateLimitBucket getOrCreateBucket(String clientId, String rateLimitRuleId, long nowMillis) {
        String bucketId = bucketId(clientId, rateLimitRuleId);
        if (!dataStore.containsRateLimitBucket(bucketId)) {
            RateLimitBucket bucket = new RateLimitBucket(bucketId, nowMillis);
            dataStore.putRateLimitBucket(bucket.getRateLimitBucketId(), bucket);
        }
        return dataStore.getRateLimitBucket(bucketId);
    }

    public void resetWindowIfExpired(RateLimitBucket bucket, RateLimitRule rule, long nowMillis) {
        if (nowMillis - bucket.getWindowStartMillis() >= rule.getWindowMillis()) {
            bucket.reset(nowMillis);
        }
    }

    // Admin methods

    public void addClient(String clientId, String name, String rateLimitPlanId) {
        Client client = new Client(clientId, name, rateLimitPlanId);
        dataStore.putClient(client.getClientId(), client);
    }

    public void addApiEndpoint(String apiEndpointId, String path, HttpMethod httpMethod) {
        ApiEndpoint apiEndpoint = new ApiEndpoint(apiEndpointId, path, httpMethod);
        dataStore.putApiEndpoint(apiEndpoint.getApiEndpointId(), apiEndpoint);
    }

    public void addRateLimitPlan(String rateLimitPlanId, String name) {
        RateLimitPlan plan = new RateLimitPlan(rateLimitPlanId, name);
        dataStore.putRateLimitPlan(plan.getRateLimitPlanId(), plan);
    }

    public void addRateLimitRule(
            String rateLimitPlanId,
            String rateLimitRuleId,
            String apiEndpointId,
            RateLimitAlgorithm rateLimitAlgorithm,
            int maxRequests,
            long windowMillis
    ) {
        RateLimitRule rule = new RateLimitRule(
                rateLimitRuleId,
                apiEndpointId,
                rateLimitAlgorithm,
                maxRequests,
                windowMillis
        );
        dataStore.putRateLimitRule(rule.getRateLimitRuleId(), rule);
        dataStore.getRateLimitPlan(rateLimitPlanId).addRateLimitRule(rule.getRateLimitRuleId());
    }

    // Util/helper methods

    private RateLimitRule findRuleForEndpoint(RateLimitPlan plan, String apiEndpointId) {
        RateLimitRule matchedRule = null;
        for (String rateLimitRuleId : plan.getRateLimitRuleList()) {
            RateLimitRule rule = dataStore.getRateLimitRule(rateLimitRuleId);
            if (rule.getApiEndpointId().equals(apiEndpointId)) {
                matchedRule = rule;
                break;
            }
        }
        return matchedRule;
    }

    private String bucketId(String clientId, String rateLimitRuleId) {
        return "bucket-" + clientId + "-" + rateLimitRuleId;
    }

    private long retryAfterMillis(RateLimitBucket bucket, RateLimitRule rule, long nowMillis) {
        return rule.getWindowMillis() - (nowMillis - bucket.getWindowStartMillis());
    }
}
