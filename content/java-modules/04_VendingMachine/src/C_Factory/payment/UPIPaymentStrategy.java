package C_Factory.payment;

import C_Factory.model.Payment;
import C_Factory.model.UPIPayment;

public class UPIPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment, int selectedProductPrice) {
        UPIPayment upiPayment = (UPIPayment) payment;
        return true;
    }
}
