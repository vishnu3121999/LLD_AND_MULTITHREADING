package E_StatePattern.payment;

import E_StatePattern.datastore.DataStore;
import E_StatePattern.model.CashPayment;
import E_StatePattern.model.Payment;
import E_StatePattern.model.UPIPayment;

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
