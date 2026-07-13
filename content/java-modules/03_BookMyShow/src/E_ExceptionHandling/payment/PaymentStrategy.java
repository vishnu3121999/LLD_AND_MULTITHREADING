package E_ExceptionHandling.payment;

import E_ExceptionHandling.model.Payment;

public interface PaymentStrategy {
    boolean pay(Payment payment);
}
