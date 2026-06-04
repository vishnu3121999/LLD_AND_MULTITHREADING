package F_OrchestrationValidation.model;

public class UPIPayment extends Payment {
    private final String upiId;

    public UPIPayment(double amount, String upiId) {
        super(amount);
        this.upiId = upiId;
    }

    public String getUpiId() {
        return upiId;
    }
}

