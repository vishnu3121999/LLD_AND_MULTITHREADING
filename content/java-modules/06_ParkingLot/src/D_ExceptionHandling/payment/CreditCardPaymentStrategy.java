package D_ExceptionHandling.payment;

import D_ExceptionHandling.model.CreditCardPayment;
import D_ExceptionHandling.model.Payment;

public class CreditCardPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        CreditCardPayment creditCardPayment = (CreditCardPayment) payment;
        return true;
    }
}


