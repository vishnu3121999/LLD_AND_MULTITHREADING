package strategy.movement;

import models.Elevator;

public interface ElevatorMovementStrategy {
    int nextFloor(Elevator elevator);
}
