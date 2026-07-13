package E_StatePattern.state;

import E_StatePattern.model.VendingMachine;
import E_StatePattern.model.enums.VendingMachineState;

public class PendingPaymentState implements VMState {
    private final VendingMachine vendingMachine;

    public PendingPaymentState(VendingMachine vendingMachine) {
        this.vendingMachine = vendingMachine;
    }

    @Override
    public void selectRack(String rackId) {
        throw new IllegalStateException("Product can only be selected from IDLE state");
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
