package A_basic.model;

import A_basic.model.enums.Direction;
import A_basic.model.enums.ElevatorState;

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

    public Elevator(String elevatorId, int capacity, int currentFloor, List<Integer> allowedFloorList) {
        this.elevatorId = elevatorId;
        this.capacity = capacity;
        this.currentFloor = currentFloor;
        this.direction = Direction.IDLE;
        this.elevatorState = ElevatorState.IDLE;
        this.allowedFloorList = new ArrayList<>(allowedFloorList);
        this.stopSet = new TreeSet<>();
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
        if (direction == Direction.DOWN) {
            Integer nextStop = stopSet.floor(currentFloor);
            return nextStop != null ? nextStop : stopSet.last();
        }
        Integer nextStop = stopSet.ceiling(currentFloor);
        return nextStop != null ? nextStop : stopSet.first();
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
