package F_Concurrency.payment;

import F_Concurrency.datastore.DataStore;
import F_Concurrency.model.CashPayment;
import F_Concurrency.model.Payment;
import F_Concurrency.model.VendingMachine;
import F_Concurrency.model.enums.Coin;

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
