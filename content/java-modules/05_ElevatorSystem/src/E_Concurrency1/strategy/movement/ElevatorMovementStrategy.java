package E_Concurrency1.strategy.movement;

import E_Concurrency1.model.Elevator;

public interface ElevatorMovementStrategy {
    int getNextStop(Elevator elevator);
}
