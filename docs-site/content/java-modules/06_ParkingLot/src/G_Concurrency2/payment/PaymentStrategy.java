package G_Concurrency2.payment;

import G_Concurrency2.model.Payment;

public interface PaymentStrategy {
    boolean pay(Payment payment);
}



