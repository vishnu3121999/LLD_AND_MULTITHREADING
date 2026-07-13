package D_ExceptionHandlingV2.payment;

import D_ExceptionHandlingV2.model.CreditCardPayment;
import D_ExceptionHandlingV2.model.Payment;
import D_ExceptionHandlingV2.model.UPIPayment;

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


