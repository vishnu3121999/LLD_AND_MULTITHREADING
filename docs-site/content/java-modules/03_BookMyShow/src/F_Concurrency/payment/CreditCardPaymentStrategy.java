package F_Concurrency.payment;

import F_Concurrency.model.CreditCardPayment;
import F_Concurrency.model.Payment;

public class CreditCardPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        CreditCardPayment creditCardPayment = (CreditCardPayment) payment;
        return true;
    }
}
