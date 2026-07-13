package D_ExceptionHandling.model;

import D_ExceptionHandling.model.enums.PaymentStatus;

import java.util.UUID;

public abstract class Payment {
    protected final String id;
    protected final double amount;
    protected PaymentStatus status;

    public Payment(double amount) {
        this.id = "payment-" + UUID.randomUUID();
        this.amount = amount;
        this.status = PaymentStatus.PENDING;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "Payment{" +
                "id='" + id + '\'' +
                ", amount=" + amount +
                ", status=" + status +
                '}';
    }

    public String getId() { return id; }
    public double getAmount() { return amount; }
    public PaymentStatus getStatus() { return status; }
}



