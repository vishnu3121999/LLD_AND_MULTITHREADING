package G_Concurrency1.payment;

import G_Concurrency1.model.Payment;

public interface PaymentStrategy {
    boolean pay(Payment payment);
}

