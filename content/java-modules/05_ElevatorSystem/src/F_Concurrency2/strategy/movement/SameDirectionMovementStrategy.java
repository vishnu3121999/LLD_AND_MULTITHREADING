package F_Concurrency2.strategy.movement;

import F_Concurrency2.model.Elevator;
import F_Concurrency2.model.enums.Direction;

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
