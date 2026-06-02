package org.example.services.payments;

import org.example.enums.PaymentType;

public class PaymentFactory {

    public static Payment get(PaymentType paymentType){
        return switch (paymentType){
            case CREDITCARD -> new CreditCardPayment();
        };
    }
}
