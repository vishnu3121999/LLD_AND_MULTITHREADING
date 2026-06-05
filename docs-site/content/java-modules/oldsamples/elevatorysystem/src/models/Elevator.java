package models;

import observer.ElevatorObserver;
import strategy.movement.ElevatorMovementStrategy;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.concurrent.atomic.AtomicInteger;

public class Elevator {
    String id;
    int capacity;
    ElevatorState elevatorState;
    Direction direction;
    int currFloor;
    TreeMap<Integer,Long> stops;      // <floor,requestedTimestamp>
    List<ElevatorObserver> observers;
    ElevatorMovementStrategy elevatorMovementStrategy;
//    HashSet<Integer> allowedFloors;        --> additional feature

    // --- Observer Pattern Methods ---
    public void addObserver(ElevatorObserver observer) {
        observers.add(observer);
        observer.update(this); // Send initial state
    }

    public void notifyObservers() {
        for (ElevatorObserver observer : observers) {
            observer.update(this);
        }
    }

    public void start() throws InterruptedException {
        // in 1 iteration lift moves 1 floor UP/DOWN
        while(elevatorState!= ElevatorState.MAINTENANCE){
            int nextStop = getNextStop();
            if(nextStop==-1){
                elevatorState = ElevatorState.IDLE;
                Thread.sleep(100);
                continue;
            }

            elevatorState = ElevatorState.MOVING;
            System.out.println(String.format("         → Elevator %s moving towards floor %d",
                    id.substring(0, 8) + "...", nextStop));
            Thread.sleep(1000);

            if(currFloor+1==nextStop || currFloor-1==nextStop){
                System.out.println(String.format("         → Elevator %s arrived at floor %d",
                        id.substring(0, 8) + "...", nextStop));
                removeStop(nextStop);
                Thread.sleep(1000); // Door open & close
            }
            if(nextStop>currFloor){
                setCurrFloor(currFloor+1);
            }
            else setCurrFloor(currFloor-1);
            notifyObservers();
        }
    }


    public Elevator(String id, int capacity, int currFloor,ElevatorMovementStrategy elevatorMovementStrategy) {
        this.id = id;
        this.capacity = capacity;
        this.currFloor = currFloor;
        stops = new TreeMap<>();
        elevatorState = ElevatorState.IDLE;
        direction = Direction.IDLE;
        this.observers  = new ArrayList<>();
        this.elevatorMovementStrategy = elevatorMovementStrategy;
    }

    public void addStop(int floor) {
        stops.putIfAbsent(floor,System.currentTimeMillis());
    }

    public void removeStop(int floor) {
        stops.remove(floor);
    }

    public int getNextStop() {
        return elevatorMovementStrategy.nextFloor(this);
    }

    // getters & setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public ElevatorState getElevatorState() {
        return elevatorState;
    }

    public void setElevatorState(ElevatorState elevatorState) {
        this.elevatorState = elevatorState;
    }

    public Direction getDirection() {
        return direction;
    }

    public void setDirection(Direction direction) {
        this.direction = direction;
    }

    public int getCurrFloor() {
        return currFloor;
    }

    public void setCurrFloor(int currFloor) {
        this.currFloor = currFloor;
    }

    public TreeMap<Integer, Long> getStops() {
        return stops;
    }

    public void setStops(TreeMap<Integer, Long> stops) {
        this.stops = stops;
    }

    public List<ElevatorObserver> getObservers() {
        return observers;
    }

    public void setObservers(List<ElevatorObserver> observers) {
        this.observers = observers;
    }

    public ElevatorMovementStrategy getElevatorMovementStrategy() {
        return elevatorMovementStrategy;
    }

    public void setElevatorMovementStrategy(ElevatorMovementStrategy elevatorMovementStrategy) {
        this.elevatorMovementStrategy = elevatorMovementStrategy;
    }
}