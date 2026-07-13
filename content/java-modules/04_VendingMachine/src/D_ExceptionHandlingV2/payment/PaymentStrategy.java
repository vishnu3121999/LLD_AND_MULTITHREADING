package D_ExceptionHandlingV2.payment;

import D_ExceptionHandlingV2.model.Payment;

public interface PaymentStrategy {
    boolean pay(Payment payment, int selectedProductPrice);
}
