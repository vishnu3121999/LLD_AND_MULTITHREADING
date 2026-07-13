package F_Concurrency2.strategy.movement;

import F_Concurrency2.model.Elevator;

public interface ElevatorMovementStrategy {
    int getNextStop(Elevator elevator);
}
