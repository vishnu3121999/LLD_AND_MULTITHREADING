package E_ExceptionHandling.payment;

import E_ExceptionHandling.model.CreditCardPayment;
import E_ExceptionHandling.model.Payment;

public class CreditCardPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        CreditCardPayment creditCardPayment = (CreditCardPayment) payment;
        return true;
    }
}
