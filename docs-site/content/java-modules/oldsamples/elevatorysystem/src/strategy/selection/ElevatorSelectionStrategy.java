package strategy.selection;

import database.DataStore;
import models.Direction;
import models.Elevator;

import java.util.List;

public interface ElevatorSelectionStrategy {

    String getElevator(List<Elevator> elevators, int floor, Direction direction);
}
