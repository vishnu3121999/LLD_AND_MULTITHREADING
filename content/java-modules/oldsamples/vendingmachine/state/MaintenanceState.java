package com.example.vm.state;

import com.example.vm.model.PaymentType;
import com.example.vm.service.VendingMachineFacade;

public class MaintenanceState implements VendingMachineState {

    private final VendingMachineFacade vm;

    public MaintenanceState(VendingMachineFacade vm) {
        this.vm = vm;
    }

    @Override
    public void selectProduct(String productId) {
        throw new IllegalStateException("Machine under maintenance");
    }

    @Override
    public boolean pay(PaymentType type) {
        throw new IllegalStateException("Machine under maintenance");
    }

    @Override
    public void cancel() {
        throw new IllegalStateException("Machine under maintenance");
    }
}
