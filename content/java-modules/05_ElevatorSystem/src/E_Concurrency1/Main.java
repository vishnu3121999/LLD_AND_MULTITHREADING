package E_Concurrency1;

import E_Concurrency1.datastore.DataStore;
import E_Concurrency1.datastore.InMemoryDataStore;
import E_Concurrency1.model.enums.Direction;
import E_Concurrency1.service.ElevatorSystemFacade;
import E_Concurrency1.strategy.assignment.ElevatorAssignmentStrategy;
import E_Concurrency1.strategy.assignment.NearestElevatorAssignmentStrategy;
import E_Concurrency1.strategy.movement.ElevatorMovementStrategy;
import E_Concurrency1.strategy.movement.SameDirectionMovementStrategy;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Main {
    public static void main(String[] args) {
        try {
            System.out.println("=== Elevator System Simulation Started ===");

            DataStore dataStore = new InMemoryDataStore();
            ElevatorAssignmentStrategy elevatorAssignmentStrategy = new NearestElevatorAssignmentStrategy();
            ElevatorMovementStrategy elevatorMovementStrategy = new SameDirectionMovementStrategy();
            ElevatorSystemFacade facade = new ElevatorSystemFacade(dataStore, elevatorAssignmentStrategy);

            runConcurrentAdminDuplicateDemo(facade);

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

            runConcurrentDestinationDemo(facade, dataStore, lobbyElevatorId, 8);

            requestAndSelectDestination(facade, dataStore, officeBuildingId, "Person-1", 0, Direction.UP, 4);
            requestAndSelectDestination(facade, dataStore, officeBuildingId, "Person-2", 6, Direction.DOWN, 2);
            requestAndSelectDestination(facade, dataStore, campusBuildingId, "Person-3", 1, Direction.UP, 3);

            printElevators("Final office building elevators", dataStore, officeBuildingId);
            printElevators("Final campus building elevators", dataStore, campusBuildingId);

            System.out.println("=== Elevator System Simulation Completed ===");
        } catch (RuntimeException exception) {
            System.out.println("Demo failed: " + exception.getMessage());
        }
    }

    private static void runConcurrentAdminDuplicateDemo(ElevatorSystemFacade facade) {
        System.out.println("Two admins try to add the same building concurrently");
        ExecutorService executorService = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);

        Future<String> adminOne = executorService.submit(addBuilding(facade, "admin-1", "building-admin-demo", ready, start));
        Future<String> adminTwo = executorService.submit(addBuilding(facade, "admin-2", "building-admin-demo", ready, start));

        try {
            ready.await();
            start.countDown();
            adminOne.get();
            adminTwo.get();
            System.out.println();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Concurrent admin demo interrupted", exception);
        } catch (ExecutionException exception) {
            throw new RuntimeException("Concurrent admin demo failed", exception);
        } finally {
            executorService.shutdown();
        }
    }

    private static Callable<String> addBuilding(ElevatorSystemFacade facade, String adminId, String buildingId,
                                                CountDownLatch ready, CountDownLatch start) {
        return () -> {
            ready.countDown();
            start.await();
            try {
                facade.addBuilding(buildingId, "ADMIN-DEMO");
                System.out.println(adminId + " added building: " + buildingId);
            } catch (RuntimeException exception) {
                System.out.println(adminId + " failed to add building: " + exception.getMessage());
            }
            return buildingId;
        };
    }

    private static void runConcurrentDestinationDemo(ElevatorSystemFacade facade, DataStore dataStore,
                                                     String elevatorId, int floor) {
        System.out.println("Two passengers enter the same destination concurrently");
        ExecutorService executorService = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);

        Future<String> userOne = executorService.submit(enterDestination(facade, "user-1", elevatorId, floor, ready, start));
        Future<String> userTwo = executorService.submit(enterDestination(facade, "user-2", elevatorId, floor, ready, start));

        try {
            ready.await();
            start.countDown();
            userOne.get();
            userTwo.get();
            System.out.println("Elevator after concurrent destination demo: " + dataStore.getElevator(elevatorId));
            System.out.println();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Concurrent destination demo interrupted", exception);
        } catch (ExecutionException exception) {
            throw new RuntimeException("Concurrent destination demo failed", exception);
        } finally {
            executorService.shutdown();
        }
    }

    private static Callable<String> enterDestination(ElevatorSystemFacade facade, String userId, String elevatorId,
                                                     int floor, CountDownLatch ready, CountDownLatch start) {
        return () -> {
            ready.countDown();
            start.await();
            facade.enterDestination(elevatorId, floor);
            System.out.println(userId + " selected floor " + floor + " in elevator " + shortId(elevatorId));
            return elevatorId;
        };
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
