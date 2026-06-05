package B_Strategy.model;

import B_Strategy.model.enums.Direction;
import B_Strategy.model.enums.ElevatorState;
import B_Strategy.strategy.movement.ElevatorMovementStrategy;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.NavigableSet;
import java.util.TreeSet;
import java.util.concurrent.locks.LockSupport;

public class Elevator {
    private final String elevatorId;
    private final int capacity;
    private int currentFloor;
    private Direction direction;
    private ElevatorState elevatorState;
    private final List<Integer> allowedFloorList;
    private final TreeSet<Integer> stopSet;
    private final ElevatorMovementStrategy elevatorMovementStrategy;

    public Elevator(String elevatorId, int capacity, int currentFloor, List<Integer> allowedFloorList,
                    ElevatorMovementStrategy elevatorMovementStrategy) {
        this.elevatorId = elevatorId;
        this.capacity = capacity;
        this.currentFloor = currentFloor;
        this.direction = Direction.IDLE;
        this.elevatorState = ElevatorState.IDLE;
        this.allowedFloorList = new ArrayList<>(allowedFloorList);
        this.stopSet = new TreeSet<>();
        this.elevatorMovementStrategy = elevatorMovementStrategy;
    }

    public void addStop(int floor) {
        stopSet.add(floor);
    }

    public void start() {
        markIdle();
        while (elevatorState != ElevatorState.MAINTENANCE) {
            if (stopSet.isEmpty()) {
                waitForNextCommand();
                continue;
            }
            moveElevator();
        }
    }

    private void moveElevator() {
        int nextStop = getNextStop();
        if (nextStop > currentFloor) {
            moveUp();
        } else if (nextStop < currentFloor) {
            moveDown();
        }
        stopSet.remove(currentFloor);
        if (stopSet.isEmpty()) {
            markIdle();
        }
    }

    public void stop() {
        direction = Direction.IDLE;
        elevatorState = ElevatorState.MAINTENANCE;
    }

    @Override
    public String toString() {
        return "Elevator{" +
                "elevatorId='" + elevatorId + '\'' +
                ", capacity=" + capacity +
                ", currentFloor=" + currentFloor +
                ", direction=" + direction +
                ", elevatorState=" + elevatorState +
                ", allowedFloorList=" + allowedFloorList +
                ", stopSet=" + stopSet +
                '}';
    }

    public String getElevatorId() {
        return elevatorId;
    }

    public int getCapacity() {
        return capacity;
    }

    public int getCurrentFloor() {
        return currentFloor;
    }

    public Direction getDirection() {
        return direction;
    }

    public ElevatorState getElevatorState() {
        return elevatorState;
    }

    public List<Integer> getAllowedFloorList() {
        return Collections.unmodifiableList(allowedFloorList);
    }

    public NavigableSet<Integer> getStopSet() {
        return Collections.unmodifiableNavigableSet(stopSet);
    }

    private int getNextStop() {
        return elevatorMovementStrategy.getNextStop(this);
    }

    private void moveUp() {
        // Simulates the time taken by a physical elevator to move up one floor.
        waitBetweenFloors();
        currentFloor++;
        direction = Direction.UP;
        elevatorState = ElevatorState.MOVING;
    }

    private void moveDown() {
        // Simulates the time taken by a physical elevator to move down one floor.
        waitBetweenFloors();
        currentFloor--;
        direction = Direction.DOWN;
        elevatorState = ElevatorState.MOVING;
    }

    private void markIdle() {
        direction = Direction.IDLE;
        elevatorState = ElevatorState.IDLE;
    }

    private void waitForNextCommand() {
        Thread.yield();
    }

    private void waitBetweenFloors() {
        LockSupport.parkNanos(300_000_000L);
    }
}
