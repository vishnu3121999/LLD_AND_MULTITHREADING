package D_ExceptionHandling.payment;

import D_ExceptionHandling.model.Payment;
import D_ExceptionHandling.model.enums.PaymentStatus;

public class PaymentProcessor {
    private final PaymentStrategyFactory paymentStrategyFactory;

    public PaymentProcessor(PaymentStrategyFactory paymentStrategyFactory) {
        this.paymentStrategyFactory = paymentStrategyFactory;
    }

    public boolean process(Payment payment, int selectedProductPrice) {
        PaymentStrategy paymentStrategy = paymentStrategyFactory.getStrategy(payment);
        boolean successful = paymentStrategy.pay(payment, selectedProductPrice);
        payment.setStatus(successful ? PaymentStatus.COMPLETED : PaymentStatus.FAILED);
        return successful;
    }
}
