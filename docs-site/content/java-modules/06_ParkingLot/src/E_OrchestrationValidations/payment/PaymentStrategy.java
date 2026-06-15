package E_OrchestrationValidations.payment;

import E_OrchestrationValidations.model.Payment;

public interface PaymentStrategy {
    boolean pay(Payment payment);
}



