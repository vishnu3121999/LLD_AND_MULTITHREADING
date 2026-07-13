package E_ExceptionHandlingV2.payment;

import E_ExceptionHandlingV2.model.CreditCardPayment;
import E_ExceptionHandlingV2.model.Payment;

public class CreditCardPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        CreditCardPayment creditCardPayment = (CreditCardPayment) payment;
        return true;
    }
}
