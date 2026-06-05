package D_ExceptionHandling.strategy.assignment;

import D_ExceptionHandling.model.Elevator;
import D_ExceptionHandling.model.enums.Direction;

import java.util.List;

public interface ElevatorAssignmentStrategy {
    String assignElevator(List<Elevator> elevatorList, int floor, Direction direction);
}
