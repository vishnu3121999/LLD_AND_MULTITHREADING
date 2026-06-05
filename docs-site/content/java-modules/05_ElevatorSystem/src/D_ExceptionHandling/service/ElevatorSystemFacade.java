package D_ExceptionHandling.service;

import D_ExceptionHandling.datastore.DataStore;
import D_ExceptionHandling.model.Building;
import D_ExceptionHandling.model.Display;
import D_ExceptionHandling.model.Elevator;
import D_ExceptionHandling.model.enums.Direction;
import D_ExceptionHandling.strategy.assignment.ElevatorAssignmentStrategy;
import D_ExceptionHandling.strategy.movement.ElevatorMovementStrategy;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

public class ElevatorSystemFacade {
    private final DataStore dataStore;
    private final ElevatorAssignmentStrategy elevatorAssignmentStrategy;

    public ElevatorSystemFacade(DataStore dataStore, ElevatorAssignmentStrategy elevatorAssignmentStrategy) {
        this.dataStore = dataStore;
        this.elevatorAssignmentStrategy = elevatorAssignmentStrategy;
    }

    // User methods

    public String requestElevator(String buildingId, int floor, Direction direction) {
        requireText(buildingId, "buildingId");
        requireNotNull(direction, "direction");
        String elevatorId = assignElevator(buildingId, floor, direction);
        Elevator elevator = getRequiredElevator(elevatorId);
        elevator.addStop(floor);
        return elevatorId;
    }

    public void enterDestination(String elevatorId, int floor) {
        requireText(elevatorId, "elevatorId");
        Elevator elevator = getRequiredElevator(elevatorId);
        elevator.addStop(floor);
    }

    // System methods

    public String assignElevator(String buildingId, int floor, Direction direction) {
        List<Elevator> elevatorList = getElevatorListForBuilding(buildingId);
        return elevatorAssignmentStrategy.assignElevator(elevatorList, floor, direction);
    }

    // Admin methods

    public void addBuilding(String buildingId, String name) {
        requireText(buildingId, "buildingId");
        requireText(name, "name");
        if (dataStore.containsBuilding(buildingId)) {
            throw new RuntimeException("Building already exists: " + buildingId);
        }
        Building building = new Building(buildingId, name);
        dataStore.putBuilding(building.getBuildingId(), building);
    }

    public void addElevator(String buildingId, String elevatorId, int capacity, int currentFloor,
                            List<Integer> allowedFloorList, ElevatorMovementStrategy elevatorMovementStrategy) {
        requireText(buildingId, "buildingId");
        requireText(elevatorId, "elevatorId");
        requirePositive(capacity, "capacity");
        requireAllowedFloorList(allowedFloorList);
        requireNotNull(elevatorMovementStrategy, "elevatorMovementStrategy");
        Building building = getRequiredBuilding(buildingId);
        if (dataStore.containsElevator(elevatorId)) {
            throw new RuntimeException("Elevator already exists: " + elevatorId);
        }
        Elevator elevator = new Elevator(elevatorId, capacity, currentFloor, allowedFloorList, elevatorMovementStrategy);
        dataStore.putElevator(elevator.getElevatorId(), elevator);
        building.addElevator(elevatorId);
    }

    public void addDisplay(String elevatorId, String displayId, int floor) {
        requireText(elevatorId, "elevatorId");
        requireText(displayId, "displayId");
        Elevator elevator = getRequiredElevator(elevatorId);
        if (dataStore.containsDisplay(displayId)) {
            throw new RuntimeException("Display already exists: " + displayId);
        }
        Display display = new Display(displayId, floor);
        dataStore.putDisplay(display.getDisplayId(), display);
        elevator.addObserver(display);
    }

    public void startElevator(String elevatorId) {
        requireText(elevatorId, "elevatorId");
        Elevator elevator = getRequiredElevator(elevatorId);
        elevator.start();
    }

    public void stopElevator(String elevatorId) {
        requireText(elevatorId, "elevatorId");
        Elevator elevator = getRequiredElevator(elevatorId);
        elevator.stop();
    }

    // Util/helper methods

    private List<Elevator> getElevatorListForBuilding(String buildingId) {
        Building building = getRequiredBuilding(buildingId);
        List<Elevator> result = new ArrayList<>();
        for (String elevatorId : building.getElevatorList()) {
            result.add(getRequiredElevator(elevatorId));
        }
        return result;
    }

    private void requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
    }

    private void requireNotNull(Object value, String fieldName) {
        if (value == null) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
    }

    private void requirePositive(int value, String fieldName) {
        if (value <= 0) {
            throw new IllegalArgumentException(fieldName + " must be positive");
        }
    }

    private void requireAllowedFloorList(List<Integer> allowedFloorList) {
        if (allowedFloorList == null || allowedFloorList.isEmpty()) {
            throw new IllegalArgumentException("allowedFloorList is required");
        }
        for (Integer floor : allowedFloorList) {
            if (floor == null) {
                throw new IllegalArgumentException("allowed floor is required");
            }
        }
    }

    private Building getRequiredBuilding(String buildingId) {
        Building building = dataStore.getBuilding(buildingId);
        if (building == null) {
            throw new NoSuchElementException("Building not found: " + buildingId);
        }
        return building;
    }

    private Elevator getRequiredElevator(String elevatorId) {
        Elevator elevator = dataStore.getElevator(elevatorId);
        if (elevator == null) {
            throw new NoSuchElementException("Elevator not found: " + elevatorId);
        }
        return elevator;
    }
}
