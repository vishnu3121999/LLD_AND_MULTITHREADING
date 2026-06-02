package E_StatePattern.state;

import E_StatePattern.model.enums.VendingMachineState;

public interface VMState {
    void selectRack(String rackId);

    void paymentCompleted();

    void completeTransaction();

    void cancelTransaction();

    VMState next();

    VendingMachineState getState();
}
