package E_Concurrency1.service;

import E_Concurrency1.datastore.DataStore;
import E_Concurrency1.model.Building;
import E_Concurrency1.model.Display;
import E_Concurrency1.model.Elevator;
import E_Concurrency1.model.enums.Direction;
import E_Concurrency1.strategy.assignment.ElevatorAssignmentStrategy;
import E_Concurrency1.strategy.movement.ElevatorMovementStrategy;

import java.util.ArrayList;
import java.util.List;

public class ElevatorSystemFacade {
    private final DataStore dataStore;
    private final ElevatorAssignmentStrategy elevatorAssignmentStrategy;
    private final ElevatorMovementService elevatorMovementService;

    public ElevatorSystemFacade(DataStore dataStore, ElevatorAssignmentStrategy elevatorAssignmentStrategy) {
        this.dataStore = dataStore;
        this.elevatorAssignmentStrategy = elevatorAssignmentStrategy;
        this.elevatorMovementService = new ElevatorMovementService();
    }

    // User methods

    public String requestElevator(String buildingId, int floor, Direction direction) {
        String elevatorId = assignElevator(buildingId, floor, direction);
        Elevator elevator = dataStore.getElevator(elevatorId);
        synchronized (elevator) {
            elevator.addStop(floor);
        }
        return elevatorId;
    }

    public void enterDestination(String elevatorId, int floor) {
        Elevator elevator = dataStore.getElevator(elevatorId);
        synchronized (elevator) {
            elevator.addStop(floor);
        }
    }

    // System methods

    public String assignElevator(String buildingId, int floor, Direction direction) {
        List<Elevator> elevatorList = getElevatorListForBuilding(buildingId);
        return elevatorAssignmentStrategy.assignElevator(elevatorList, floor, direction);
    }

    // Admin methods

    public void addBuilding(String buildingId, String name) {
        if (dataStore.containsBuilding(buildingId)) {
            throw new RuntimeException("Building already exists: " + buildingId);
        }
        Building building = new Building(buildingId, name);
        dataStore.putBuilding(building.getBuildingId(), building);
    }

    public void addElevator(String buildingId, String elevatorId, int capacity, int currentFloor,
                            List<Integer> allowedFloorList, ElevatorMovementStrategy elevatorMovementStrategy) {
        Building building = dataStore.getBuilding(buildingId);
        if (dataStore.containsElevator(elevatorId)) {
            throw new RuntimeException("Elevator already exists: " + elevatorId);
        }
        Elevator elevator = new Elevator(elevatorId, capacity, currentFloor, allowedFloorList, elevatorMovementStrategy);
        dataStore.putElevator(elevator.getElevatorId(), elevator);
        building.addElevator(elevatorId);
    }

    public void addDisplay(String elevatorId, String displayId, int floor) {
        Elevator elevator = dataStore.getElevator(elevatorId);
        if (dataStore.containsDisplay(displayId)) {
            throw new RuntimeException("Display already exists: " + displayId);
        }
        Display display = new Display(displayId, floor);
        dataStore.putDisplay(display.getDisplayId(), display);
        elevator.addObserver(display);
    }

    public void startElevator(String elevatorId) {
        Elevator elevator = dataStore.getElevator(elevatorId);
        elevatorMovementService.start(elevator);
    }

    public void stopElevator(String elevatorId) {
        Elevator elevator = dataStore.getElevator(elevatorId);
        elevator.stop();
    }

    // Util/helper methods

    private List<Elevator> getElevatorListForBuilding(String buildingId) {
        Building building = dataStore.getBuilding(buildingId);
        List<Elevator> result = new ArrayList<>();
        for (String elevatorId : building.getElevatorList()) {
            result.add(dataStore.getElevator(elevatorId));
        }
        return result;
    }
}
