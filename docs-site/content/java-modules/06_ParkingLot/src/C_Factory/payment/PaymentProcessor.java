package C_Factory.payment;

import C_Factory.model.Payment;
import C_Factory.model.enums.PaymentStatus;

public class PaymentProcessor {
    private final PaymentStrategyFactory paymentStrategyFactory;

    public PaymentProcessor(PaymentStrategyFactory paymentStrategyFactory) {
        this.paymentStrategyFactory = paymentStrategyFactory;
    }

    public boolean process(Payment payment) {
        PaymentStrategy paymentStrategy = paymentStrategyFactory.getStrategy(payment);
        boolean successful = paymentStrategy.pay(payment);
        payment.setStatus(successful ? PaymentStatus.COMPLETED : PaymentStatus.FAILED);
        return successful;
    }
}


