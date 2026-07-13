package C_Observer.strategy.assignment;

import C_Observer.model.Elevator;
import C_Observer.model.enums.Direction;

import java.util.List;

public interface ElevatorAssignmentStrategy {
    String assignElevator(List<Elevator> elevatorList, int floor, Direction direction);
}
