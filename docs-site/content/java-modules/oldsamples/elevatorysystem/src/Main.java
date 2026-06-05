import database.DataStore;
import models.Direction;
import models.Elevator;
import models.ElevatorState;
import observer.HallDisplay;
import services.ServiceFacade;
import strategy.movement.SameDirectionStrategy;
import strategy.selection.MinSeekTimeStrategy;

import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class Main {
    private static final Random random = new Random();
    
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Elevator System Simulation Started ===\n");
        
        DataStore dataStore = new DataStore();
        ServiceFacade api = new ServiceFacade(dataStore, new MinSeekTimeStrategy());

        // Initialize elevators at different starting floors
        var e1 = api.addElevator(10, new SameDirectionStrategy());
        var e2 = api.addElevator(10, new SameDirectionStrategy());
        
        // Set initial floors
        dataStore.getElevator(e1).setCurrFloor(2);
        dataStore.getElevator(e2).setCurrFloor(5);

        dataStore.getElevator(e1).addObserver(new HallDisplay());
        dataStore.getElevator(e2).addObserver(new HallDisplay());

        ExecutorService executorService = Executors.newCachedThreadPool();
        executorService.submit(() -> {
            try {
                dataStore.getElevator(e1).start();
            } catch (Exception e) {
                System.err.println("Elevator 1 error: " + e.getMessage());
            }
        });
        executorService.submit(() -> {
            try {
                dataStore.getElevator(e2).start();
            } catch (Exception e) {
                System.err.println("Elevator 2 error: " + e.getMessage());
            }
        });

        // Give elevators time to start
        Thread.sleep(1000);

        // Simulate realistic scenarios - each thread acts as a person: requests elevator, waits for it to come & enters dest floor
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(100);
        
        // Scenario 1: Morning rush - people going up from ground floor

        scheduleRequest(scheduler, api, dataStore,"Person-1", 0, Direction.UP, 2,0);
        scheduleRequest(scheduler, api, dataStore, "Person-2",0, Direction.UP, 5,2);
        scheduleRequest(scheduler, api, dataStore, "Person-3",0, Direction.UP, 10,4);
        
        // Scenario 2: Mid-morning - mixed traffic
        scheduleRequest(scheduler, api, dataStore, "Person-4",3, Direction.DOWN, 1,8);
        scheduleRequest(scheduler, api, dataStore, "Person-5",7, Direction.UP, 9,10);


        // Keep simulation running
        Thread.sleep(60000); // Run for 1 minute (elevators move faster now)
        
        System.out.println("\n=== Simulation Complete - Shutting down ===");
        scheduler.shutdown();
        executorService.shutdown();
        
        // Wait for tasks to complete
        if (!executorService.awaitTermination(10, TimeUnit.SECONDS)) {
            executorService.shutdownNow();
        }
    }

    private static void scheduleRequest(ScheduledExecutorService scheduler, ServiceFacade api, DataStore dataStore,
                                       String personId, int requestFloor, Direction direction,int destinationFloor ,
                                       int delaySeconds) {
        scheduler.schedule(() -> {
            // Request elevator (adds pickup floor as stop)
            String elevatorId = api.requestElevator(requestFloor, direction);
            Elevator elevator = dataStore.getElevator(elevatorId);
            System.out.println(String.format("[Time: %ds] %s at floor %d requests elevator, wants to go %s (destination: floor %d); Assigned elevator-%s",
                    delaySeconds, personId,requestFloor, direction, destinationFloor,elevatorId.substring(0, 8) + "..."));
            while (elevator.getCurrFloor()!=requestFloor){
                try {
                    Thread.sleep(10);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
            System.out.println(String.format("         → Person-%d enters elevator %s at floor %d and selects floor %d",personId,
                    elevatorId.substring(0, 8) + "...", requestFloor, destinationFloor));
            api.selectFloor(elevatorId, destinationFloor);
        }, delaySeconds, TimeUnit.SECONDS);
    }
}



