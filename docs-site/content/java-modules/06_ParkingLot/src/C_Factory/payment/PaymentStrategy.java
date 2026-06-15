package C_Factory.payment;

import C_Factory.model.Payment;

public interface PaymentStrategy {
    boolean pay(Payment payment);
}

