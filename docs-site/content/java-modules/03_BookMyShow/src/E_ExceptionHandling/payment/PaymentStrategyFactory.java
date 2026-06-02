package E_ExceptionHandling.payment;

import E_ExceptionHandling.model.CreditCardPayment;
import E_ExceptionHandling.model.Payment;
import E_ExceptionHandling.model.UPIPayment;

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
