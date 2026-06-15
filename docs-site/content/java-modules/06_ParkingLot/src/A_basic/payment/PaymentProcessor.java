package A_basic.payment;

import A_basic.model.CreditCardPayment;
import A_basic.model.Payment;
import A_basic.model.UPIPayment;
import A_basic.model.enums.PaymentStatus;

public class PaymentProcessor {
    public boolean process(Payment payment) {
        boolean successful = false;
        if (payment instanceof CreditCardPayment) {
            successful = handleCardPayment((CreditCardPayment) payment);
        } else if (payment instanceof UPIPayment) {
            successful = handleUPIPayment((UPIPayment) payment);
        }

        payment.setStatus(successful ? PaymentStatus.COMPLETED : PaymentStatus.FAILED);
        return successful;
    }

    private boolean handleCardPayment(CreditCardPayment payment) {
        return true;
    }

    private boolean handleUPIPayment(UPIPayment payment) {
        return true;
    }
}
