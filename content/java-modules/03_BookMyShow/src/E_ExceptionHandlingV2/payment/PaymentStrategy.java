package E_ExceptionHandlingV2.payment;

import E_ExceptionHandlingV2.model.Payment;

public interface PaymentStrategy {
    boolean pay(Payment payment);
}
