package H_Concurrency2.payment;

import H_Concurrency2.model.CreditCardPayment;
import H_Concurrency2.model.Payment;

public class CreditCardPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        CreditCardPayment creditCardPayment = (CreditCardPayment) payment;
        return true;
    }
}

