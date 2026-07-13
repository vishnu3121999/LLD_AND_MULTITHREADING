package A_basic.model;

public class Balance {
    private final String balanceId;
    private final String fromUserId;
    private final String toUserId;
    private double amount;
    public Balance(String balanceId, String fromUserId, String toUserId) { this.balanceId = balanceId; this.fromUserId = fromUserId; this.toUserId = toUserId; }
    public void addAmount(double amount) { this.amount += amount; }
    @Override public String toString() { return "Balance{" + "balanceId='" + balanceId + "'" + ", fromUserId='" + fromUserId + "'" + ", toUserId='" + toUserId + "'" + ", amount=" + amount + '}'; }
    public String getBalanceId() { return balanceId; }
    public String getFromUserId() { return fromUserId; }
    public String getToUserId() { return toUserId; }
    public double getAmount() { return amount; }
}
