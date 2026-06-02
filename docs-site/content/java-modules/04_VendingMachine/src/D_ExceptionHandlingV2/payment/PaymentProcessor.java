package D_ExceptionHandlingV2.payment;

import D_ExceptionHandlingV2.model.Payment;
import D_ExceptionHandlingV2.model.enums.PaymentStatus;

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
