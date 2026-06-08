package A_basic.model;

import A_basic.model.enums.BreakerState;

public class CircuitBreaker {
    private final String circuitBreakerId;
    private final int failureThreshold;
    private int failureCount;
    private BreakerState breakerState;
    public CircuitBreaker(String circuitBreakerId, int failureThreshold) { this.circuitBreakerId = circuitBreakerId; this.failureThreshold = failureThreshold; this.breakerState = BreakerState.CLOSED; }
    public void recordSuccess() { failureCount = 0; breakerState = BreakerState.CLOSED; }
    public void recordFailure() { failureCount++; if (failureCount >= failureThreshold) breakerState = BreakerState.OPEN; }
    @Override public String toString() { return "CircuitBreaker{" + "circuitBreakerId='" + circuitBreakerId + "'" + ", failureThreshold=" + failureThreshold + ", failureCount=" + failureCount + ", breakerState=" + breakerState + '}'; }
    public String getCircuitBreakerId() { return circuitBreakerId; }
    public int getFailureThreshold() { return failureThreshold; }
    public int getFailureCount() { return failureCount; }
    public BreakerState getBreakerState() { return breakerState; }
}
