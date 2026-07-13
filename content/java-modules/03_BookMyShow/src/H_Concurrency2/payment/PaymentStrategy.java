package H_Concurrency2.payment;

import H_Concurrency2.model.Payment;

public interface PaymentStrategy {
    boolean pay(Payment payment);
}

