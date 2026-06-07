package D_ExceptionHandling.model;

import D_ExceptionHandling.model.enums.Direction;
import D_ExceptionHandling.model.enums.ElevatorState;
import D_ExceptionHandling.observer.ElevatorObserver;
import D_ExceptionHandling.strategy.movement.ElevatorMovementStrategy;

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
    private final List<ElevatorObserver> observerList;

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
        this.observerList = new ArrayList<>();
    }

    public void addStop(int floor) {
        if (elevatorState == ElevatorState.MAINTENANCE) {
            throw new IllegalStateException("Elevator cannot accept stops in MAINTENANCE state: " + elevatorId);
        }
        stopSet.add(floor);
        notifyObservers();
    }

    public void addObserver(ElevatorObserver elevatorObserver) {
        observerList.add(elevatorObserver);
        elevatorObserver.update(this);
    }

    public void start() {
        if (elevatorState == ElevatorState.MAINTENANCE) {
            throw new IllegalStateException("Elevator cannot start while MAINTENANCE: " + elevatorId);
        }
        markIdle();
    }

    public void moveElevator() {
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
        notifyObservers();
    }

    public void stop() {
        if (elevatorState == ElevatorState.MAINTENANCE) {
            throw new IllegalStateException("Elevator is already in MAINTENANCE state: " + elevatorId);
        }
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

    public boolean isInMaintenance() {
        return elevatorState == ElevatorState.MAINTENANCE;
    }

    public boolean hasPendingStops() {
        return !stopSet.isEmpty();
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

    private void notifyObservers() {
        for (ElevatorObserver elevatorObserver : observerList) {
            elevatorObserver.update(this);
        }
    }

    private void waitBetweenFloors() {
        LockSupport.parkNanos(300_000_000L);
    }
}
