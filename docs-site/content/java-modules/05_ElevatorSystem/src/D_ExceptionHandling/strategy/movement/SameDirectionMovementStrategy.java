package D_ExceptionHandling.strategy.movement;

import D_ExceptionHandling.model.Elevator;
import D_ExceptionHandling.model.enums.Direction;

public class SameDirectionMovementStrategy implements ElevatorMovementStrategy {
    @Override
    public int getNextStop(Elevator elevator) {
        if (elevator.getDirection() == Direction.DOWN) {
            Integer nextStop = elevator.getStopSet().floor(elevator.getCurrentFloor());
            return nextStop != null ? nextStop : elevator.getStopSet().last();
        }
        Integer nextStop = elevator.getStopSet().ceiling(elevator.getCurrentFloor());
        return nextStop != null ? nextStop : elevator.getStopSet().first();
    }
}
