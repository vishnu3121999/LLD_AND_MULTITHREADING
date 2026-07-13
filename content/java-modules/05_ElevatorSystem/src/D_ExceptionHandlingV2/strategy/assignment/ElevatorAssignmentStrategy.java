package D_ExceptionHandlingV2.strategy.assignment;

import D_ExceptionHandlingV2.model.Elevator;
import D_ExceptionHandlingV2.model.enums.Direction;

import java.util.List;

public interface ElevatorAssignmentStrategy {
    String assignElevator(List<Elevator> elevatorList, int floor, Direction direction);
}
