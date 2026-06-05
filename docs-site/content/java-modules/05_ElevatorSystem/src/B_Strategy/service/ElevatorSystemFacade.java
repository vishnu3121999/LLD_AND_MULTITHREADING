package B_Strategy.service;

import B_Strategy.datastore.DataStore;
import B_Strategy.model.Building;
import B_Strategy.model.Display;
import B_Strategy.model.Elevator;
import B_Strategy.model.enums.Direction;
import B_Strategy.strategy.assignment.ElevatorAssignmentStrategy;
import B_Strategy.strategy.movement.ElevatorMovementStrategy;

import java.util.ArrayList;
import java.util.List;

public class ElevatorSystemFacade {
    private final DataStore dataStore;
    private final ElevatorAssignmentStrategy elevatorAssignmentStrategy;

    public ElevatorSystemFacade(DataStore dataStore, ElevatorAssignmentStrategy elevatorAssignmentStrategy) {
        this.dataStore = dataStore;
        this.elevatorAssignmentStrategy = elevatorAssignmentStrategy;
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

    public void addDisplay(String displayId, int floor) {
        Display display = new Display(displayId, floor);
        dataStore.putDisplay(display.getDisplayId(), display);
    }

    public void startElevator(String elevatorId) {
        Elevator elevator = dataStore.getElevator(elevatorId);
        elevator.start();
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
