package F_Concurrency1.payment;

import F_Concurrency1.model.CreditCardPayment;
import F_Concurrency1.model.Payment;
import F_Concurrency1.model.UPIPayment;

public class PaymentStrategyFactory {
    public PaymentStrategy getStrategy(Payment payment) {
        if (payment instanceof CreditCardPayment) {
            return new CreditCardPaymentStrategy();
        }
        if (payment instanceof UPIPayment) {
            return new UPIPaymentStrategy();
        }
        throw new IllegalArgumentException("Unsupported payment type");
    }
}


