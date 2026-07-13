package B_Strategy.strategy.movement;

import B_Strategy.model.Elevator;
import B_Strategy.model.enums.Direction;

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
