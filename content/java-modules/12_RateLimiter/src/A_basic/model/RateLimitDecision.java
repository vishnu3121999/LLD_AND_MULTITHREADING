package A_basic.model;

import A_basic.model.enums.RateLimitStatus;

public class RateLimitDecision {
    private final String clientId;
    private final String apiEndpointId;
    private final RateLimitStatus rateLimitStatus;
    private final int remainingRequests;
    private final long retryAfterMillis;
    private final long requestedAtMillis;

    public RateLimitDecision(
            String clientId,
            String apiEndpointId,
            RateLimitStatus rateLimitStatus,
            int remainingRequests,
            long retryAfterMillis,
            long requestedAtMillis
    ) {
        this.clientId = clientId;
        this.apiEndpointId = apiEndpointId;
        this.rateLimitStatus = rateLimitStatus;
        this.remainingRequests = remainingRequests;
        this.retryAfterMillis = retryAfterMillis;
        this.requestedAtMillis = requestedAtMillis;
    }

    public String getClientId() {
        return clientId;
    }

    public String getApiEndpointId() {
        return apiEndpointId;
    }

    public RateLimitStatus getRateLimitStatus() {
        return rateLimitStatus;
    }

    public int getRemainingRequests() {
        return remainingRequests;
    }

    public long getRetryAfterMillis() {
        return retryAfterMillis;
    }

    public long getRequestedAtMillis() {
        return requestedAtMillis;
    }

    @Override
    public String toString() {
        return "RateLimitDecision{"
                + "clientId='" + clientId + '\''
                + ", apiEndpointId='" + apiEndpointId + '\''
                + ", rateLimitStatus=" + rateLimitStatus
                + ", remainingRequests=" + remainingRequests
                + ", retryAfterMillis=" + retryAfterMillis
                + ", requestedAtMillis=" + requestedAtMillis
                + '}';
    }
}
