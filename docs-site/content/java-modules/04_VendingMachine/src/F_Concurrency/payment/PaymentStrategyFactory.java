package F_Concurrency.payment;

import F_Concurrency.datastore.DataStore;
import F_Concurrency.model.CashPayment;
import F_Concurrency.model.Payment;
import F_Concurrency.model.UPIPayment;

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
