package E_OrchestrationValidations.payment;

import E_OrchestrationValidations.model.CreditCardPayment;
import E_OrchestrationValidations.model.Payment;
import E_OrchestrationValidations.model.UPIPayment;

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


