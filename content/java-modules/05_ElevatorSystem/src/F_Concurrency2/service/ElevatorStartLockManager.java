package F_Concurrency2.service;

import java.util.HashSet;
import java.util.Set;

public class ElevatorStartLockManager {
    private final Set<String> runningElevatorIdSet;

    public ElevatorStartLockManager() {
        this.runningElevatorIdSet = new HashSet<>();
    }

    public synchronized boolean tryStart(String elevatorId) {
        if (runningElevatorIdSet.contains(elevatorId)) {
            return false;
        }
        runningElevatorIdSet.add(elevatorId);
        return true;
    }

    public synchronized void finish(String elevatorId) {
        runningElevatorIdSet.remove(elevatorId);
    }
}
