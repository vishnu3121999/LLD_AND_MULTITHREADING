package E_StatePattern.payment;

import E_StatePattern.model.Payment;
import E_StatePattern.model.UPIPayment;

public class UPIPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment, int selectedProductPrice) {
        UPIPayment upiPayment = (UPIPayment) payment;
        return true;
    }
}
