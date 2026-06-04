package H_Concurrency2.payment;

import H_Concurrency2.model.Payment;
import H_Concurrency2.model.UPIPayment;

public class UPIPaymentStrategy implements PaymentStrategy {
    @Override
    public boolean pay(Payment payment) {
        UPIPayment upiPayment = (UPIPayment) payment;
        return true;
    }
}

