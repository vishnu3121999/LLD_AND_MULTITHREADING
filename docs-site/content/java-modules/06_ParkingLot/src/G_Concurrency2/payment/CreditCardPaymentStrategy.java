package G_Concurrency2.payment;

import G_Concurrency2.model.CreditCardPayment;
import G_Concurrency2.model.Payment;

public class CreditCardPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        CreditCardPayment creditCardPayment = (CreditCardPayment) payment;
        return true;
    }
}



