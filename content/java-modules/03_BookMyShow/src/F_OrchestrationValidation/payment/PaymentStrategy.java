package F_OrchestrationValidation.payment;

import F_OrchestrationValidation.model.Payment;

public interface PaymentStrategy {
    boolean pay(Payment payment);
}

