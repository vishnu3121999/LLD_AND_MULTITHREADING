package D_COR.payment;

import D_COR.model.Payment;

public interface PaymentStrategy {
    boolean pay(Payment payment);
}
