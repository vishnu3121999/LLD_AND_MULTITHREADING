package F_OrchestrationValidation.payment;

import F_OrchestrationValidation.model.CreditCardPayment;
import F_OrchestrationValidation.model.Payment;
import F_OrchestrationValidation.model.UPIPayment;

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

