package C_Factory.payment;

import C_Factory.datastore.DataStore;
import C_Factory.model.CashPayment;
import C_Factory.model.Payment;
import C_Factory.model.UPIPayment;

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
