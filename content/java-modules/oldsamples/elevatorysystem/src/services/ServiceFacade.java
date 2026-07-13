package services;

import database.DataStore;
import models.Direction;
import models.Elevator;
import models.ElevatorState;
import strategy.movement.ElevatorMovementStrategy;
import strategy.selection.ElevatorSelectionStrategy;

import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ServiceFacade {

    DataStore dataStore;
    ElevatorSelectionStrategy elevatorSelectionStrategy;
    ExecutorService executorService = Executors.newCachedThreadPool();

    public ServiceFacade(DataStore dataStore, ElevatorSelectionStrategy elevatorSelectionStrategy){
        this.dataStore = dataStore;
        this.elevatorSelectionStrategy = elevatorSelectionStrategy;
    }

    // Admin APIs
    public void start(String elevatorId){
        Elevator elevator = dataStore.getElevator(elevatorId);
        elevator.setDirection(Direction.IDLE);
        elevator.setElevatorState(ElevatorState.IDLE);
    }
    public void stop(String elevatorId){
        Elevator elevator = dataStore.getElevator(elevatorId);
        elevator.setDirection(Direction.IDLE);
        elevator.setElevatorState(ElevatorState.MAINTENANCE);
    }
    public String addElevator(int capacity, ElevatorMovementStrategy elevatorMovementStrategy){
        String id = UUID.randomUUID().toString();
        var elevator = new Elevator(id,capacity,0,elevatorMovementStrategy);
        dataStore.putElevator(id,elevator);
        return id;
    }
    public void removeElevator(String id){
        dataStore.removeElevator(id);
    }

    // User APIs
    // called from hall
    public String requestElevator(int floor, Direction direction){
        String id = elevatorSelectionStrategy.getElevator(dataStore.getAllElevators(),floor,direction);
        dataStore.getElevator(id).addStop(floor);
        return id;
    }
    //called from inside the elevator
    public void selectFloor(String eleId, int floor){
        dataStore.getElevator(eleId).addStop(floor);
    }

}


