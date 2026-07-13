package A_basic.model;

public class RateLimitBucket {
    private final String rateLimitBucketId;
    private long windowStartMillis;
    private int requestCount;

    public RateLimitBucket(String rateLimitBucketId, long windowStartMillis) {
        this.rateLimitBucketId = rateLimitBucketId;
        this.windowStartMillis = windowStartMillis;
        this.requestCount = 0;
    }

    public void reset(long windowStartMillis) {
        this.windowStartMillis = windowStartMillis;
        this.requestCount = 0;
    }

    public void increment() {
        requestCount++;
    }

    public int getRemainingRequests(int maxRequests) {
        return maxRequests - requestCount;
    }

    public String getRateLimitBucketId() {
        return rateLimitBucketId;
    }

    public long getWindowStartMillis() {
        return windowStartMillis;
    }

    public int getRequestCount() {
        return requestCount;
    }

    @Override
    public String toString() {
        return "RateLimitBucket{"
                + "rateLimitBucketId='" + rateLimitBucketId + '\''
                + ", windowStartMillis=" + windowStartMillis
                + ", requestCount=" + requestCount
                + '}';
    }
}
