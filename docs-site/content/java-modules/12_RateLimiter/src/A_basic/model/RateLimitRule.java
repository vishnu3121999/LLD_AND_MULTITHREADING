package A_basic.model;

public class RateLimitRule {
    private final String rateLimitRuleId;
    private final int maxRequests;
    private final long windowMillis;
    public RateLimitRule(String rateLimitRuleId, int maxRequests, long windowMillis) { this.rateLimitRuleId = rateLimitRuleId; this.maxRequests = maxRequests; this.windowMillis = windowMillis; }
    @Override public String toString() { return "RateLimitRule{" + "rateLimitRuleId='" + rateLimitRuleId + "'" + ", maxRequests=" + maxRequests + ", windowMillis=" + windowMillis + '}'; }
    public String getRateLimitRuleId() { return rateLimitRuleId; }
    public int getMaxRequests() { return maxRequests; }
    public long getWindowMillis() { return windowMillis; }
}
