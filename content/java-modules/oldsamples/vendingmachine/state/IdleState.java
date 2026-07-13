package com.example.vm.state;

import com.example.vm.service.VendingMachineFacade;

public class IdleState implements VendingMachineState {

    private final VendingMachineFacade vm;

    public IdleState(VendingMachineFacade vm) {
        this.vm = vm;
    }

    @Override
    public void selectProduct(String productId) {
        var racks = vm.getDb().getRacks();
        for (var rack : racks.values()) {
            if (rack.getProductId().equals(productId)
                    && rack.getProductCount() == 0) {
                throw new RuntimeException("Item Out Of Stock");
            }
        }
        vm.setSelectedProduct(productId);
        vm.setState(new PendingPaymentState(vm));
    }

    @Override
    public boolean pay(com.example.vm.model.PaymentType type) {
        throw new IllegalStateException("No product selected");
    }

    @Override
    public void cancel() {
        throw new IllegalStateException("No transaction to cancel");
    }
}
