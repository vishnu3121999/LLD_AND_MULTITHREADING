package F_Concurrency.state;

import F_Concurrency.model.VendingMachine;
import F_Concurrency.model.enums.VendingMachineState;

public class IdleState implements VMState {
    private final VendingMachine vendingMachine;

    public IdleState(VendingMachine vendingMachine) {
        this.vendingMachine = vendingMachine;
    }

    @Override
    public void selectRack(String rackId) {
        vendingMachine.setSelectedRackId(rackId);
        vendingMachine.setVendingMachineState(next());
    }

    @Override
    public void paymentCompleted() {
        throw new IllegalStateException("Payment can only be completed from PENDING_PAYMENT state");
    }

    @Override
    public void completeTransaction() {
        throw new IllegalStateException("Transaction can only be completed from READY_TO_DISPENSE state");
    }

    @Override
    public void cancelTransaction() {
        throw new IllegalStateException("Transaction can only be cancelled from PENDING_PAYMENT state");
    }

    @Override
    public VMState next() {
        return new PendingPaymentState(vendingMachine);
    }

    @Override
    public VendingMachineState getState() {
        return VendingMachineState.IDLE;
    }
}
