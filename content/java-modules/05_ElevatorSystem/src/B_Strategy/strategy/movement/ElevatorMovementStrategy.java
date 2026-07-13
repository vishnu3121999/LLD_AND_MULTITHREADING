package B_Strategy.strategy.movement;

import B_Strategy.model.Elevator;

public interface ElevatorMovementStrategy {
    int getNextStop(Elevator elevator);
}
