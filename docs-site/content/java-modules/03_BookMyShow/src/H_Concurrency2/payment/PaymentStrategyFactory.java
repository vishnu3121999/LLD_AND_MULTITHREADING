package H_Concurrency2.payment;

import H_Concurrency2.model.CreditCardPayment;
import H_Concurrency2.model.Payment;
import H_Concurrency2.model.UPIPayment;

public class PaymentStrategyFactory {
    public PaymentStrategy getStrategy(Payment payment) {
        if (payment instanceof CreditCardPayment) {
            return new CreditCardPaymentStrategy();
        }
        if (payment instanceof UPIPayment) {
            return new UPIPaymentStrategy();
        }
        return null;
    }
}

