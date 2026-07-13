package strategy.movement;

import models.Direction;
import models.Elevator;
import strategy.selection.ElevatorSelectionStrategy;

import java.util.List;

public class SameDirectionStrategy implements ElevatorMovementStrategy {

    @Override
    public int nextFloor(Elevator elevator) {
        var dir = elevator.getDirection();
        int currFloor = elevator.getCurrFloor();
        if(elevator.getStops().isEmpty())return -1;
        
        if(dir==Direction.UP || dir==Direction.IDLE){
            // Find next floor above current floor (skip current floor if it's in stops)
            Integer nextFloor = elevator.getStops().ceilingKey(currFloor);
            if(nextFloor==null){
                // No floors above, try going down
                elevator.setDirection(Direction.DOWN);
                return nextFloor(elevator);
            }
            elevator.setDirection(Direction.UP);
            return nextFloor;
        }
        else {
            // Find next floor below current floor (skip current floor if it's in stops)
            Integer nextFloor = elevator.getStops().floorKey(currFloor);
            if(nextFloor==null){
                // No floors below, try going up
                elevator.setDirection(Direction.UP);
                return nextFloor(elevator);
            }
            elevator.setDirection(Direction.DOWN);
            return nextFloor;
        }
    }
}


