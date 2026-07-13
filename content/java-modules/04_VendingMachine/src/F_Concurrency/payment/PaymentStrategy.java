package F_Concurrency.payment;

import F_Concurrency.model.Payment;

public interface PaymentStrategy {
    boolean pay(Payment payment, int selectedProductPrice);
}
