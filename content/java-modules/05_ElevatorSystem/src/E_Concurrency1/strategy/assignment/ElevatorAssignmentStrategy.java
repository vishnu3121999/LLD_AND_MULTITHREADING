package E_Concurrency1.strategy.assignment;

import E_Concurrency1.model.Elevator;
import E_Concurrency1.model.enums.Direction;

import java.util.List;

public interface ElevatorAssignmentStrategy {
    String assignElevator(List<Elevator> elevatorList, int floor, Direction direction);
}
