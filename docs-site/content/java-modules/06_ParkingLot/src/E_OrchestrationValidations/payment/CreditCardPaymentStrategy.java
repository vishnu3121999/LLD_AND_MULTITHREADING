package E_OrchestrationValidations.payment;

import E_OrchestrationValidations.model.CreditCardPayment;
import E_OrchestrationValidations.model.Payment;

public class CreditCardPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        CreditCardPayment creditCardPayment = (CreditCardPayment) payment;
        return true;
    }
}



