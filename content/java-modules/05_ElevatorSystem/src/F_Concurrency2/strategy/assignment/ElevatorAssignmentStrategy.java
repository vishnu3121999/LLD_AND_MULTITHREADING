package F_Concurrency2.strategy.assignment;

import F_Concurrency2.model.Elevator;
import F_Concurrency2.model.enums.Direction;

import java.util.List;

public interface ElevatorAssignmentStrategy {
    String assignElevator(List<Elevator> elevatorList, int floor, Direction direction);
}
