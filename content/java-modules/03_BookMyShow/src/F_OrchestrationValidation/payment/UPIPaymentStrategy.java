package F_OrchestrationValidation.payment;

import F_OrchestrationValidation.model.Payment;
import F_OrchestrationValidation.model.UPIPayment;

public class UPIPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        UPIPayment upiPayment = (UPIPayment) payment;
        return true;
    }
}

