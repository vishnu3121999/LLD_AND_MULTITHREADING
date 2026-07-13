package B_Strategy.model;

import B_Strategy.model.enums.PaymentStatus;

import java.util.UUID;

public abstract class Payment {
    protected final String id;
    protected final int amount;
    protected PaymentStatus status;

    public Payment(int amount) {
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

    public String getId() {
        return id;
    }

    public int getAmount() {
        return amount;
    }

    public PaymentStatus getStatus() {
        return status;
    }
}
