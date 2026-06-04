package F_OrchestrationValidation.payment;

import F_OrchestrationValidation.model.CreditCardPayment;
import F_OrchestrationValidation.model.Payment;

public class CreditCardPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        CreditCardPayment creditCardPayment = (CreditCardPayment) payment;
        return true;
    }
}

