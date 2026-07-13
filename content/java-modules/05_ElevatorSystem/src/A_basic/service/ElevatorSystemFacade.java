package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.Building;
import A_basic.model.Display;
import A_basic.model.Elevator;
import A_basic.model.enums.Direction;

import java.util.ArrayList;
import java.util.List;

public class ElevatorSystemFacade {
    private final DataStore dataStore;
    private final ElevatorMovementService elevatorMovementService;

    public ElevatorSystemFacade(DataStore dataStore) {
        this.dataStore = dataStore;
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
        return findBestElevator(buildingId, floor);
    }

    // Admin methods

    public void addBuilding(String buildingId, String name) {
        Building building = new Building(buildingId, name);
        dataStore.putBuilding(building.getBuildingId(), building);
    }

    public void addElevator(String buildingId, String elevatorId, int capacity, int currentFloor, List<Integer> allowedFloorList) {
        Elevator elevator = new Elevator(elevatorId, capacity, currentFloor, allowedFloorList);
        dataStore.putElevator(elevator.getElevatorId(), elevator);
        dataStore.getBuilding(buildingId).addElevator(elevatorId);
    }

    public void addDisplay(String displayId, int floor) {
        Display display = new Display(displayId, floor);
        dataStore.putDisplay(display.getDisplayId(), display);
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

    private String findBestElevator(String buildingId, int floor) {
        List<Elevator> candidateList = getElevatorListForBuilding(buildingId);
        Elevator bestElevator = candidateList.get(0);
        int bestDistance = distance(bestElevator, floor);
        for (Elevator elevator : candidateList) {
            int distance = distance(elevator, floor);
            if (distance < bestDistance) {
                bestElevator = elevator;
                bestDistance = distance;
            }
        }
        return bestElevator.getElevatorId();
    }

    private List<Elevator> getElevatorListForBuilding(String buildingId) {
        Building building = dataStore.getBuilding(buildingId);
        List<Elevator> result = new ArrayList<>();
        for (String elevatorId : building.getElevatorList()) {
            result.add(dataStore.getElevator(elevatorId));
        }
        return result;
    }

    private int distance(Elevator elevator, int floor) {
        return Math.abs(elevator.getCurrentFloor() - floor);
    }
}
