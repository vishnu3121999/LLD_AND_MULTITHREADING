package B_Strategy.payment;

import B_Strategy.datastore.DataStore;
import B_Strategy.model.CashPayment;
import B_Strategy.model.Payment;
import B_Strategy.model.VendingMachine;
import B_Strategy.model.enums.Coin;

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
