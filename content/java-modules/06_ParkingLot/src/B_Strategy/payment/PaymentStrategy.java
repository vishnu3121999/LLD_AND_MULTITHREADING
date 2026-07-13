package B_Strategy.payment;

import B_Strategy.model.Payment;

public interface PaymentStrategy {
    boolean pay(Payment payment);
}
