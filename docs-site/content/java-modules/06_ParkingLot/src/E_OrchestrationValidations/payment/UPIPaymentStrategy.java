package E_OrchestrationValidations.payment;

import E_OrchestrationValidations.model.Payment;
import E_OrchestrationValidations.model.UPIPayment;

public class UPIPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        UPIPayment upiPayment = (UPIPayment) payment;
        return true;
    }
}



