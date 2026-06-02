package E_StatePattern.payment;

import E_StatePattern.model.Payment;

public interface PaymentStrategy {
    boolean pay(Payment payment, int selectedProductPrice);
}
