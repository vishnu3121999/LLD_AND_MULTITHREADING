package D_ExceptionHandlingV2.payment;

import D_ExceptionHandlingV2.datastore.DataStore;
import D_ExceptionHandlingV2.model.CashPayment;
import D_ExceptionHandlingV2.model.Payment;
import D_ExceptionHandlingV2.model.VendingMachine;
import D_ExceptionHandlingV2.model.enums.Coin;

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
