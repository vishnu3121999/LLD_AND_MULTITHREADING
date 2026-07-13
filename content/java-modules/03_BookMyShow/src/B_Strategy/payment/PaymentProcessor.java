package B_Strategy.payment;

import B_Strategy.model.CreditCardPayment;
import B_Strategy.model.Payment;
import B_Strategy.model.UPIPayment;
import B_Strategy.model.enums.PaymentStatus;

public class PaymentProcessor {
    private final PaymentStrategy creditCardPaymentStrategy;
    private final PaymentStrategy upiPaymentStrategy;

    public PaymentProcessor() {
        this.creditCardPaymentStrategy = new CreditCardPaymentStrategy();
        this.upiPaymentStrategy = new UPIPaymentStrategy();
    }

    public boolean process(Payment payment) {
        boolean successful = false;
        if (payment instanceof CreditCardPayment) {
            successful = creditCardPaymentStrategy.pay(payment);
        } else if (payment instanceof UPIPayment) {
            successful = upiPaymentStrategy.pay(payment);
        } else {
            throw new IllegalArgumentException("Unsupported payment type");
        }

        payment.setStatus(successful ? PaymentStatus.COMPLETED : PaymentStatus.FAILED);
        return successful;
    }
}
