package com.example.vm.state;

import com.example.vm.model.PaymentType;
import com.example.vm.service.VendingMachineFacade;

public class PendingPaymentState implements VendingMachineState {

    private final VendingMachineFacade vm;

    public PendingPaymentState(VendingMachineFacade vm) {
        this.vm = vm;
    }

    @Override
    public void selectProduct(String productId) {
        throw new IllegalStateException("Product already selected");
    }

    @Override
    public boolean pay(PaymentType type) {
        boolean success = vm.processPayment(type);
        if (success) {
            vm.setState(new DispatchingState(vm));
            vm.dispatchProduct(vm.getSelectedProduct());
            vm.clearSelection();
            vm.setState(new IdleState(vm));
            return true;
        }
        return false;
    }

    @Override
    public void cancel() {
        vm.clearSelection();
        vm.setState(new IdleState(vm));
    }
}

