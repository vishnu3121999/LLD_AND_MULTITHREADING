package F_Concurrency.state;

import F_Concurrency.model.enums.VendingMachineState;

public interface VMState {
    void selectRack(String rackId);

    void paymentCompleted();

    void completeTransaction();

    void cancelTransaction();

    VMState next();

    VendingMachineState getState();
}
