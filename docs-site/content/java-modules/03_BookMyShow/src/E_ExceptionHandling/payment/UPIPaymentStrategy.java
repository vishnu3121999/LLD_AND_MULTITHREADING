package E_ExceptionHandling.payment;

import E_ExceptionHandling.model.Payment;
import E_ExceptionHandling.model.UPIPayment;

public class UPIPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        UPIPayment upiPayment = (UPIPayment) payment;
        return true;
    }
}
