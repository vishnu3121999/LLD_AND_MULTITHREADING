package com.example.vm.factory;

import com.example.vm.model.PaymentType;
import com.example.vm.strategy.CashStrategy;
import com.example.vm.strategy.PaymentStrategy;
import com.example.vm.strategy.UPIStrategy;

public class PaymentFactory {
    public PaymentStrategy getPaymentStrategy(PaymentType type){
        if(type==PaymentType.CASH)return new CashStrategy();
        else if(type==PaymentType.UPI) return new UPIStrategy();
        else throw new IllegalArgumentException("Unknown Type");
    }
}

