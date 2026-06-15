package F_Concurrency1.payment;

import F_Concurrency1.model.CreditCardPayment;
import F_Concurrency1.model.Payment;

public class CreditCardPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        CreditCardPayment creditCardPayment = (CreditCardPayment) payment;
        return true;
    }
}



