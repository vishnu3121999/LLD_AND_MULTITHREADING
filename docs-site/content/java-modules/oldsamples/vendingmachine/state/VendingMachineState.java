package com.example.vm.state;

import com.example.vm.model.PaymentType;

public interface VendingMachineState {

    void selectProduct(String productId);

    boolean pay(PaymentType type);

    void cancel();
}



