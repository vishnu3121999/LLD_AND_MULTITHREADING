package E_Concurrency1.service;

import E_Concurrency1.model.Elevator;

public class ElevatorMovementService {
    private final ElevatorStartLockManager elevatorStartLockManager;

    public ElevatorMovementService() {
        this.elevatorStartLockManager = new ElevatorStartLockManager();
    }

    public void start(String elevatorId, Elevator elevator) {
        if (!elevatorStartLockManager.tryStart(elevatorId)) {
            throw new IllegalStateException("Elevator is already running: " + elevatorId);
        }
        try {
            elevator.start();
            while (!elevator.isInMaintenance()) {
                if (elevator.hasPendingStops()) {
                    elevator.moveElevator();
                    continue;
                }
                waitForNextCommand();
            }
        } finally {
            elevatorStartLockManager.finish(elevatorId);
        }
    }

    private void waitForNextCommand() {
        Thread.yield();
    }
}