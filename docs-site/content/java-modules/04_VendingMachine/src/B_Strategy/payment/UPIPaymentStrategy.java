package B_Strategy.payment;

import B_Strategy.model.Payment;
import B_Strategy.model.UPIPayment;

public class UPIPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment, int selectedProductPrice) {
        UPIPayment upiPayment = (UPIPayment) payment;
        return true;
    }
}
