package B_Strategy.strategy.assignment;

import B_Strategy.model.Elevator;
import B_Strategy.model.enums.Direction;

import java.util.List;

public class NearestElevatorAssignmentStrategy implements ElevatorAssignmentStrategy {
    @Override
    public String assignElevator(List<Elevator> elevatorList, int floor, Direction direction) {
        Elevator bestElevator = null;
        int bestDistance = Integer.MAX_VALUE;
        for (Elevator elevator : elevatorList) {
            if (!canServeFloor(elevator, floor)) {
                continue;
            }
            int distance = distance(elevator, floor);
            if (bestElevator == null || distance < bestDistance) {
                bestElevator = elevator;
                bestDistance = distance;
            }
        }
        return bestElevator == null ? null : bestElevator.getElevatorId();
    }

    private int distance(Elevator elevator, int floor) {
        return Math.abs(elevator.getCurrentFloor() - floor);
    }

    private boolean canServeFloor(Elevator elevator, int floor) {
        return elevator.getAllowedFloorList().contains(floor);
    }
}
