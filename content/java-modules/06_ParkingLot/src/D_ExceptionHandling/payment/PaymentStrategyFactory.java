package D_ExceptionHandling.payment;

import D_ExceptionHandling.model.CreditCardPayment;
import D_ExceptionHandling.model.Payment;
import D_ExceptionHandling.model.UPIPayment;

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

