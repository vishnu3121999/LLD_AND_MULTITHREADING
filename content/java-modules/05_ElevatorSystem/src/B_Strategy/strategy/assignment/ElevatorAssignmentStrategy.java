package B_Strategy.strategy.assignment;

import B_Strategy.model.Elevator;
import B_Strategy.model.enums.Direction;

import java.util.List;

public interface ElevatorAssignmentStrategy {
    String assignElevator(List<Elevator> elevatorList, int floor, Direction direction);
}
