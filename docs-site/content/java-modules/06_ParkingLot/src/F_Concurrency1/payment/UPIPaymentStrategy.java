package F_Concurrency1.payment;

import F_Concurrency1.model.Payment;
import F_Concurrency1.model.UPIPayment;

public class UPIPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        UPIPayment upiPayment = (UPIPayment) payment;
        return true;
    }
}



