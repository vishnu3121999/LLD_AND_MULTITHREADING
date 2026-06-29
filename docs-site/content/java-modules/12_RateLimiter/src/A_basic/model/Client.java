package A_basic.model;

public class Client {
    private final String clientId;
    private final String name;
    private final String rateLimitPlanId;

    public Client(String clientId, String name, String rateLimitPlanId) {
        this.clientId = clientId;
        this.name = name;
        this.rateLimitPlanId = rateLimitPlanId;
    }

    public String getClientId() {
        return clientId;
    }

    public String getName() {
        return name;
    }

    public String getRateLimitPlanId() {
        return rateLimitPlanId;
    }

    @Override
    public String toString() {
        return "Client{"
                + "clientId='" + clientId + '\''
                + ", name='" + name + '\''
                + ", rateLimitPlanId='" + rateLimitPlanId + '\''
                + '}';
    }
}
