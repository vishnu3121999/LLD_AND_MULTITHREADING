package D_ExceptionHandling.payment;

import D_ExceptionHandling.model.Payment;

public interface PaymentStrategy {
    boolean pay(Payment payment, int selectedProductPrice);
}
