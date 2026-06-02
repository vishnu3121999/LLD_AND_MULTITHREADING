package B_Strategy.model;

import B_Strategy.model.enums.PaymentStatus;

import java.util.UUID;

public abstract class Payment {
    protected String id;
    protected double amount;
    protected PaymentStatus status;

    public Payment(double amount) {
        this.id = "payment-" + UUID.randomUUID();
        this.amount = amount;
        this.status = PaymentStatus.PENDING;
    }

    public String getId() {
        return id;
    }

    public double getAmount() {
        return amount;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }
}
