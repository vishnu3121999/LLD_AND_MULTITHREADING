package F_Concurrency2.service;

import F_Concurrency2.model.Elevator;

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
            synchronized (elevator) {
                elevator.start();
            }
            while (true) {
                synchronized (elevator) {
                    if (elevator.isInMaintenance()) {
                        return;
                    }
                    if (elevator.hasPendingStops()) {
                        elevator.moveElevator();
                        continue;
                    }
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