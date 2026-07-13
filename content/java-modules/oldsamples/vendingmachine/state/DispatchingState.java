package com.example.vm.state;

import com.example.vm.model.PaymentType;
import com.example.vm.service.VendingMachineFacade;

public class DispatchingState implements VendingMachineState {

    private final VendingMachineFacade vm;

    public DispatchingState(VendingMachineFacade vm) {
        this.vm = vm;
    }

    @Override
    public void selectProduct(String productId) {
        throw new IllegalStateException("Dispatch in progress");
    }

    @Override
    public boolean pay(PaymentType type) {
        throw new IllegalStateException("Payment not allowed during dispatch");
    }

    @Override
    public void cancel() {
        throw new IllegalStateException("Cannot cancel during dispatch");
    }
}

