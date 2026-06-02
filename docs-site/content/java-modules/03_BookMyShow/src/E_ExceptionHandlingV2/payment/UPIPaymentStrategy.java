package E_ExceptionHandlingV2.payment;

import E_ExceptionHandlingV2.model.Payment;
import E_ExceptionHandlingV2.model.UPIPayment;

public class UPIPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        UPIPayment upiPayment = (UPIPayment) payment;
        return true;
    }
}
