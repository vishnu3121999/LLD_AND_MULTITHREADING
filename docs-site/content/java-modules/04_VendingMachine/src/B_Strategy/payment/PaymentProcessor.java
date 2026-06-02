package B_Strategy.payment;

import B_Strategy.datastore.DataStore;
import B_Strategy.model.Payment;
import B_Strategy.model.UPIPayment;
import B_Strategy.model.CashPayment;
import B_Strategy.model.enums.PaymentStatus;

public class PaymentProcessor {
    private final PaymentStrategy cashPaymentStrategy;
    private final PaymentStrategy upiPaymentStrategy;

    public PaymentProcessor(DataStore dataStore) {
        this.cashPaymentStrategy = new CashPaymentStrategy(dataStore);
        this.upiPaymentStrategy = new UPIPaymentStrategy();
    }

    public boolean process(Payment payment, int selectedProductPrice) {
        boolean successful = false;
        if (payment instanceof CashPayment) {
            successful = cashPaymentStrategy.pay(payment, selectedProductPrice);
        } else if (payment instanceof UPIPayment) {
            successful = upiPaymentStrategy.pay(payment, selectedProductPrice);
        }

        payment.setStatus(successful ? PaymentStatus.COMPLETED : PaymentStatus.FAILED);
        return successful;
    }
}
