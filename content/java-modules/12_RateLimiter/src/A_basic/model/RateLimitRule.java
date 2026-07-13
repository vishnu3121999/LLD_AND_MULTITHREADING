package A_basic.model;

import A_basic.model.enums.RateLimitAlgorithm;

public class RateLimitRule {
    private final String rateLimitRuleId;
    private final String apiEndpointId;
    private final RateLimitAlgorithm rateLimitAlgorithm;
    private final int maxRequests;
    private final long windowMillis;

    public RateLimitRule(
            String rateLimitRuleId,
            String apiEndpointId,
            RateLimitAlgorithm rateLimitAlgorithm,
            int maxRequests,
            long windowMillis
    ) {
        this.rateLimitRuleId = rateLimitRuleId;
        this.apiEndpointId = apiEndpointId;
        this.rateLimitAlgorithm = rateLimitAlgorithm;
        this.maxRequests = maxRequests;
        this.windowMillis = windowMillis;
    }

    public String getRateLimitRuleId() {
        return rateLimitRuleId;
    }

    public String getApiEndpointId() {
        return apiEndpointId;
    }

    public RateLimitAlgorithm getRateLimitAlgorithm() {
        return rateLimitAlgorithm;
    }

    public int getMaxRequests() {
        return maxRequests;
    }

    public long getWindowMillis() {
        return windowMillis;
    }

    @Override
    public String toString() {
        return "RateLimitRule{"
                + "rateLimitRuleId='" + rateLimitRuleId + '\''
                + ", apiEndpointId='" + apiEndpointId + '\''
                + ", rateLimitAlgorithm=" + rateLimitAlgorithm
                + ", maxRequests=" + maxRequests
                + ", windowMillis=" + windowMillis
                + '}';
    }
}
