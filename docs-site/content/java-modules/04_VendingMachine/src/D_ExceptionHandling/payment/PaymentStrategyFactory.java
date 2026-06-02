package D_ExceptionHandling.payment;

import D_ExceptionHandling.datastore.DataStore;
import D_ExceptionHandling.model.CashPayment;
import D_ExceptionHandling.model.Payment;
import D_ExceptionHandling.model.UPIPayment;

public class PaymentStrategyFactory {
    private final DataStore dataStore;

    public PaymentStrategyFactory(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public PaymentStrategy getStrategy(Payment payment) {
        if (payment instanceof CashPayment) {
            return new CashPaymentStrategy(dataStore);
        }
        if (payment instanceof UPIPayment) {
            return new UPIPaymentStrategy();
        }
        throw new IllegalArgumentException("Unsupported payment type");
    }
}
