package E_ExceptionHandlingV2.payment;

import E_ExceptionHandlingV2.model.CreditCardPayment;
import E_ExceptionHandlingV2.model.Payment;
import E_ExceptionHandlingV2.model.UPIPayment;

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
