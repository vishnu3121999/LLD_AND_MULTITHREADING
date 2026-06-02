package com.example.vm.strategy;

public class CashStrategy implements PaymentStrategy{
    @Override
    public boolean processPayment() {
        // If received cash excess, trigger dispatch change method.
        return true;
    }
}
