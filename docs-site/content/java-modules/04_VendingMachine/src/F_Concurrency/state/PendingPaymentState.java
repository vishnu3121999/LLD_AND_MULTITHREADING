package F_Concurrency.state;

import F_Concurrency.model.VendingMachine;
import F_Concurrency.model.enums.VendingMachineState;

public class PendingPaymentState implements VMState {
    private final VendingMachine vendingMachine;

    public PendingPaymentState(VendingMachine vendingMachine) {
        this.vendingMachine = vendingMachine;
    }

    @Override
    public void selectRack(String rackId) {
        vendingMachine.setSelectedRackId(rackId);
    }

    @Override
    public void paymentCompleted() {
        vendingMachine.setVendingMachineState(next());
    }

    @Override
    public void completeTransaction() {
        throw new IllegalStateException("Transaction can only be completed from READY_TO_DISPENSE state");
    }

    @Override
    public void cancelTransaction() {
        vendingMachine.setSelectedRackId(null);
        vendingMachine.setVendingMachineState(new IdleState(vendingMachine));
    }

    @Override
    public VMState next() {
        return new ReadyToDispenseState(vendingMachine);
    }

    @Override
    public VendingMachineState getState() {
        return VendingMachineState.PENDING_PAYMENT;
    }
}
