package G_Concurrency2.payment;

import G_Concurrency2.model.Payment;
import G_Concurrency2.model.UPIPayment;

public class UPIPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        UPIPayment upiPayment = (UPIPayment) payment;
        return true;
    }
}



