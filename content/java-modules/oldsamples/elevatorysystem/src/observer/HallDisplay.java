package observer;

import models.Elevator;
import models.ElevatorState;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class HallDisplay implements ElevatorObserver {
    String id;
    int floor;
    private static final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");
    
    @Override
    public void update(Elevator elevator) {
        String time = LocalTime.now().format(timeFormatter);
        String state = elevator.getElevatorState() == ElevatorState.MOVING ? "MOVING" : 
                      elevator.getElevatorState() == ElevatorState.IDLE ? "IDLE" : "MAINTENANCE";
        int stopsCount = elevator.getStops().size();
        
        System.out.println(String.format("[%s] Elevator %s | Floor: %2d | Direction: %-5s | State: %-10s | Pending Stops: %d",
            time, 
            elevator.getId().substring(0, 8) + "...",
            elevator.getCurrFloor(),
            elevator.getDirection(),
            state,
            stopsCount));
    }
}



