package D_ExceptionHandlingV2.strategy.movement;

import D_ExceptionHandlingV2.model.Elevator;

public interface ElevatorMovementStrategy {
    int getNextStop(Elevator elevator);
}
