package E_StatePattern.state;

import E_StatePattern.model.VendingMachine;
import E_StatePattern.model.enums.VendingMachineState;

public class ReadyToDispenseState implements VMState {
    private final VendingMachine vendingMachine;

    public ReadyToDispenseState(VendingMachine vendingMachine) {
        this.vendingMachine = vendingMachine;
    }

    @Override
    public void selectRack(String rackId) {
        throw new IllegalStateException("Product can only be selected from IDLE state");
    }

    @Override
    public void paymentCompleted() {
        throw new IllegalStateException("Payment can only be completed from PENDING_PAYMENT state");
    }

    @Override
    public void completeTransaction() {
        vendingMachine.setSelectedRackId(null);
        vendingMachine.setVendingMachineState(next());
    }

    @Override
    public void cancelTransaction() {
        throw new IllegalStateException("Transaction can only be cancelled from PENDING_PAYMENT state");
    }

    @Override
    public VMState next() {
        return new IdleState(vendingMachine);
    }

    @Override
    public VendingMachineState getState() {
        return VendingMachineState.READY_TO_DISPENSE;
    }
}
