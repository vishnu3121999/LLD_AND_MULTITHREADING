package D_ExceptionHandling.strategy.movement;

import D_ExceptionHandling.model.Elevator;

public interface ElevatorMovementStrategy {
    int getNextStop(Elevator elevator);
}
