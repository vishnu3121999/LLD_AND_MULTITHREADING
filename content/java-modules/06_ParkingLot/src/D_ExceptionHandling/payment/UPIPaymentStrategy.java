package D_ExceptionHandling.payment;

import D_ExceptionHandling.model.Payment;
import D_ExceptionHandling.model.UPIPayment;

public class UPIPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        UPIPayment upiPayment = (UPIPayment) payment;
        return true;
    }
}


