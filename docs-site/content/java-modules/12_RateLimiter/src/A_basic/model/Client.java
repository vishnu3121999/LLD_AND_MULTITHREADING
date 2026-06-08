package A_basic.model;

public class Client {
    private final String clientId;
    private final String name;
    private final String rateLimitRuleId;
    public Client(String clientId, String name, String rateLimitRuleId) { this.clientId = clientId; this.name = name; this.rateLimitRuleId = rateLimitRuleId; }
    @Override public String toString() { return "Client{" + "clientId='" + clientId + "'" + ", name='" + name + "'" + ", rateLimitRuleId='" + rateLimitRuleId + "'" + '}'; }
    public String getClientId() { return clientId; }
    public String getName() { return name; }
    public String getRateLimitRuleId() { return rateLimitRuleId; }
}
