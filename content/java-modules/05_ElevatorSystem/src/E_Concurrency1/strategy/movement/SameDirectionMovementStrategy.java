package E_Concurrency1.strategy.movement;

import E_Concurrency1.model.Elevator;
import E_Concurrency1.model.enums.Direction;

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
