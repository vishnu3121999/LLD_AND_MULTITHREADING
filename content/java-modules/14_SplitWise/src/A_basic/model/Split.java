package A_basic.model;

public class Split {
    private final String splitId;
    private final String userId;
    private final double amount;
    public Split(String splitId, String userId, double amount) { this.splitId = splitId; this.userId = userId; this.amount = amount; }
    @Override public String toString() { return "Split{" + "splitId='" + splitId + "'" + ", userId='" + userId + "'" + ", amount=" + amount + '}'; }
    public String getSplitId() { return splitId; }
    public String getUserId() { return userId; }
    public double getAmount() { return amount; }
}
