package D_ExceptionHandlingV2.payment;

import D_ExceptionHandlingV2.model.Payment;
import D_ExceptionHandlingV2.model.UPIPayment;

public class UPIPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment, int selectedProductPrice) {
        UPIPayment upiPayment = (UPIPayment) payment;
        return true;
    }
}
