package C_Observer.service;

import C_Observer.datastore.DataStore;
import C_Observer.model.Building;
import C_Observer.model.Display;
import C_Observer.model.Elevator;
import C_Observer.model.enums.Direction;
import C_Observer.strategy.assignment.ElevatorAssignmentStrategy;
import C_Observer.strategy.movement.ElevatorMovementStrategy;

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
        elevator.addStop(floor);
        return elevatorId;
    }

    public void enterDestination(String elevatorId, int floor) {
        Elevator elevator = dataStore.getElevator(elevatorId);
        elevator.addStop(floor);
    }

    // System methods

    public String assignElevator(String buildingId, int floor, Direction direction) {
        List<Elevator> elevatorList = getElevatorListForBuilding(buildingId);
        return elevatorAssignmentStrategy.assignElevator(elevatorList, floor, direction);
    }

    // Admin methods

    public void addBuilding(String buildingId, String name) {
        Building building = new Building(buildingId, name);
        dataStore.putBuilding(building.getBuildingId(), building);
    }

    public void addElevator(String buildingId, String elevatorId, int capacity, int currentFloor,
                            List<Integer> allowedFloorList, ElevatorMovementStrategy elevatorMovementStrategy) {
        Elevator elevator = new Elevator(elevatorId, capacity, currentFloor, allowedFloorList, elevatorMovementStrategy);
        dataStore.putElevator(elevator.getElevatorId(), elevator);
        dataStore.getBuilding(buildingId).addElevator(elevatorId);
    }

    public void addDisplay(String elevatorId, String displayId, int floor) {
        Elevator elevator = dataStore.getElevator(elevatorId);
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
