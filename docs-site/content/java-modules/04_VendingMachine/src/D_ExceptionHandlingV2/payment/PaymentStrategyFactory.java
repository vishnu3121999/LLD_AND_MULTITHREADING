package D_ExceptionHandlingV2.payment;

import D_ExceptionHandlingV2.datastore.DataStore;
import D_ExceptionHandlingV2.model.CashPayment;
import D_ExceptionHandlingV2.model.Payment;
import D_ExceptionHandlingV2.model.UPIPayment;

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
        return null;
    }
}
