package F_Concurrency.payment;

import F_Concurrency.model.Payment;
import F_Concurrency.model.UPIPayment;

public class UPIPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        UPIPayment upiPayment = (UPIPayment) payment;
        return true;
    }
}
