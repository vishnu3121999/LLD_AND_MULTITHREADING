package C_Observer;

import C_Observer.datastore.DataStore;
import C_Observer.datastore.InMemoryDataStore;
import C_Observer.model.enums.Direction;
import C_Observer.service.ElevatorSystemFacade;
import C_Observer.strategy.assignment.ElevatorAssignmentStrategy;
import C_Observer.strategy.assignment.NearestElevatorAssignmentStrategy;
import C_Observer.strategy.movement.ElevatorMovementStrategy;
import C_Observer.strategy.movement.SameDirectionMovementStrategy;

import java.util.List;
import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Elevator System Simulation Started ===");

        DataStore dataStore = new InMemoryDataStore();
        ElevatorAssignmentStrategy elevatorAssignmentStrategy = new NearestElevatorAssignmentStrategy();
        ElevatorMovementStrategy elevatorMovementStrategy = new SameDirectionMovementStrategy();
        ElevatorSystemFacade facade = new ElevatorSystemFacade(dataStore, elevatorAssignmentStrategy);

        String officeBuildingId = id("building");
        String campusBuildingId = id("building");
        String lobbyElevatorId = id("elevator");
        String midRiseElevatorId = id("elevator");
        String campusElevatorId = id("elevator");
        String lobbyDisplayId = id("display");
        String midRiseDisplayId = id("display");
        String campusDisplayId = id("display");

        facade.addBuilding(officeBuildingId, "Office Tower");
        facade.addBuilding(campusBuildingId, "Campus Annex");

        facade.addElevator(officeBuildingId, lobbyElevatorId, 8, 0,
                List.of(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10), elevatorMovementStrategy);
        facade.addElevator(officeBuildingId, midRiseElevatorId, 10, 6,
                List.of(0, 2, 4, 6, 8, 10), elevatorMovementStrategy);
        facade.addElevator(campusBuildingId, campusElevatorId, 6, 1,
                List.of(0, 1, 2, 3, 4), elevatorMovementStrategy);

        facade.addDisplay(lobbyElevatorId, lobbyDisplayId, 0);
        facade.addDisplay(midRiseElevatorId, midRiseDisplayId, 6);
        facade.addDisplay(campusElevatorId, campusDisplayId, 1);

        printElevators("Initial office building elevators", dataStore, officeBuildingId);
        printElevators("Initial campus building elevators", dataStore, campusBuildingId);
        printDisplays("Displays", dataStore, lobbyDisplayId, midRiseDisplayId, campusDisplayId);

        requestAndSelectDestination(facade, dataStore, officeBuildingId, "Person-1", 0, Direction.UP, 4);
        requestAndSelectDestination(facade, dataStore, officeBuildingId, "Person-2", 6, Direction.DOWN, 2);
        requestAndSelectDestination(facade, dataStore, campusBuildingId, "Person-3", 1, Direction.UP, 3);

        printElevators("Final office building elevators", dataStore, officeBuildingId);
        printElevators("Final campus building elevators", dataStore, campusBuildingId);

        System.out.println("=== Elevator System Simulation Completed ===");
    }

    private static void requestAndSelectDestination(ElevatorSystemFacade facade, DataStore dataStore, String buildingId,
                                                    String personId, int requestFloor, Direction direction,
                                                    int destinationFloor) {
        String elevatorId = facade.requestElevator(buildingId, requestFloor, direction);

        System.out.println(personId + " requests elevator at floor " + requestFloor +
                " going " + direction + ". Assigned elevator: " + shortId(elevatorId));
        System.out.println(dataStore.getElevator(elevatorId));

        System.out.println(personId + " enters elevator " + shortId(elevatorId) +
                " at floor " + requestFloor + " and selects floor " + destinationFloor);
        facade.enterDestination(elevatorId, destinationFloor);
        System.out.println(dataStore.getElevator(elevatorId));
        System.out.println();
    }

    private static void printElevators(String label, DataStore dataStore, String buildingId) {
        System.out.println(label);
        for (String elevatorId : dataStore.getBuilding(buildingId).getElevatorList()) {
            System.out.println(dataStore.getElevator(elevatorId));
        }
        System.out.println();
    }

    private static void printDisplays(String label, DataStore dataStore, String... displayIds) {
        System.out.println(label);
        for (String displayId : displayIds) {
            System.out.println(dataStore.getDisplay(displayId));
        }
        System.out.println();
    }

    private static String id(String prefix) {
        return prefix + "-" + UUID.randomUUID();
    }

    private static String shortId(String id) {
        return id.substring(0, 17);
    }
}
