package A_basic.model;

public class DownstreamService {
    private final String downstreamServiceId;
    private final String name;
    private final String circuitBreakerId;
    public DownstreamService(String downstreamServiceId, String name, String circuitBreakerId) { this.downstreamServiceId = downstreamServiceId; this.name = name; this.circuitBreakerId = circuitBreakerId; }
    @Override public String toString() { return "DownstreamService{" + "downstreamServiceId='" + downstreamServiceId + "'" + ", name='" + name + "'" + ", circuitBreakerId='" + circuitBreakerId + "'" + '}'; }
    public String getDownstreamServiceId() { return downstreamServiceId; }
    public String getName() { return name; }
    public String getCircuitBreakerId() { return circuitBreakerId; }
}
