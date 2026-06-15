package F_Concurrency1.payment;

import F_Concurrency1.model.Payment;

public interface PaymentStrategy {
    boolean pay(Payment payment);
}



