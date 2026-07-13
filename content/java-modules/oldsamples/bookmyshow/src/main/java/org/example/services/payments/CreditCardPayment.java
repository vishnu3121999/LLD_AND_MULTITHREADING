package org.example.services.payments;

public class CreditCardPayment implements Payment{
    @Override
    public boolean processPayment() {
        return true;
    }
}
