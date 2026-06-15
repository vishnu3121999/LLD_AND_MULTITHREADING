package D_ExceptionHandlingV2.model;

public class UPIPayment extends Payment {
    private final String upiId;

    public UPIPayment(double amount, String upiId) {
        super(amount);
        this.upiId = upiId;
    }

    @Override
    public String toString() {
        return "UPIPayment{" +
                "id='" + id + '\'' +
                ", amount=" + amount +
                ", upiId='" + upiId + '\'' +
                ", status=" + status +
                '}';
    }

    public String getUpiId() { return upiId; }
}




