package A_basic.payment;

import A_basic.datastore.DataStore;
import A_basic.model.CashPayment;
import A_basic.model.Payment;
import A_basic.model.UPIPayment;
import A_basic.model.VendingMachine;
import A_basic.model.enums.Coin;
import A_basic.model.enums.PaymentStatus;

public class PaymentProcessor {
    private final DataStore dataStore;

    public PaymentProcessor(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public boolean process(Payment payment, int selectedProductPrice) {
        boolean successful = false;
        if (payment instanceof CashPayment) {
            successful = handleCashPayment((CashPayment) payment, selectedProductPrice);
        } else if (payment instanceof UPIPayment) {
            successful = handleUPIPayment((UPIPayment) payment, selectedProductPrice);
        }

        payment.setStatus(successful ? PaymentStatus.COMPLETED : PaymentStatus.FAILED);
        return successful;
    }

    private boolean handleCashPayment(CashPayment payment, int selectedProductPrice) {
        VendingMachine vendingMachine = dataStore.getVendingMachine();
        for (Coin coin : payment.getCoinList()) {
            vendingMachine.addCoin(coin, 1);
        }
        return true;
    }

    private boolean handleUPIPayment(UPIPayment payment, int selectedProductPrice) {
        return true;
    }
}
