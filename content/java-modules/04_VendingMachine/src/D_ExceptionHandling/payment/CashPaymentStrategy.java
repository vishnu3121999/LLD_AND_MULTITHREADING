package D_ExceptionHandling.payment;

import D_ExceptionHandling.datastore.DataStore;
import D_ExceptionHandling.model.CashPayment;
import D_ExceptionHandling.model.Payment;
import D_ExceptionHandling.model.VendingMachine;
import D_ExceptionHandling.model.enums.Coin;

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
