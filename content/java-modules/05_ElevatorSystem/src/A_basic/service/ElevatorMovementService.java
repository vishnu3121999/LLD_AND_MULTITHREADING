package A_basic.service;

import A_basic.model.Elevator;

public class ElevatorMovementService {
    public void start(Elevator elevator) {
        elevator.start();
        while (!elevator.isInMaintenance()) {
            if (elevator.hasPendingStops()) {
                elevator.moveElevator();
                continue;
            }
            waitForNextCommand();
        }
    }

    private void waitForNextCommand() {
        Thread.yield();
    }
}