package C_Observer.strategy.movement;

import C_Observer.model.Elevator;

public interface ElevatorMovementStrategy {
    int getNextStop(Elevator elevator);
}
