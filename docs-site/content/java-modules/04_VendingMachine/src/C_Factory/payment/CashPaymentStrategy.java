package C_Factory.payment;

import C_Factory.datastore.DataStore;
import C_Factory.model.CashPayment;
import C_Factory.model.Payment;
import C_Factory.model.VendingMachine;
import C_Factory.model.enums.Coin;

public class CashPaymentStrategy implements PaymentStrategy {
    private final DataStore dataStore;

    public CashPaymentStrategy(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    @Override
    public boolean pay(Payment payment, int selectedProductPrice) {
        CashPayment cashPayment = (CashPayment) payment;
        VendingMachine vendingMachine = dataStore.getVendingMachine();
        for (Coin coin : cashPayment.getCoinList()) {
            vendingMachine.addCoin(coin, 1);
        }
        return true;
    }
}
