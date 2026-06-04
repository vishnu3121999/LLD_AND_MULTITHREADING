package G_Concurrency1.payment;

import G_Concurrency1.model.CreditCardPayment;
import G_Concurrency1.model.Payment;

public class CreditCardPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        CreditCardPayment creditCardPayment = (CreditCardPayment) payment;
        return true;
    }
}

