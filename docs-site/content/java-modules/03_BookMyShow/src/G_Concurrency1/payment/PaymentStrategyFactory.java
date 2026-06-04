package G_Concurrency1.payment;

import G_Concurrency1.model.CreditCardPayment;
import G_Concurrency1.model.Payment;
import G_Concurrency1.model.UPIPayment;

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

