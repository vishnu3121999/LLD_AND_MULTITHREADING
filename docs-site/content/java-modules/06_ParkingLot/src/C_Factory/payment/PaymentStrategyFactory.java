package C_Factory.payment;

import C_Factory.model.CreditCardPayment;
import C_Factory.model.Payment;
import C_Factory.model.UPIPayment;

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
