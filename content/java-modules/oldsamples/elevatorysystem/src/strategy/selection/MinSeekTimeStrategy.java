package strategy.selection;

import database.DataStore;
import models.Direction;
import models.Elevator;
import models.ElevatorState;

import java.util.List;

// elevator which is IDLE or moving in same Dir & closest to requested floor
public class MinSeekTimeStrategy implements ElevatorSelectionStrategy {
    @Override
    public String getElevator(List<Elevator> elevators, int floor, Direction direction) {
        int minDist = Integer.MAX_VALUE;
        String minEleId = null;
        for(var ele : elevators){
            var dir = ele.getDirection();
            int currFloor = ele.getCurrFloor();
            if(ele.getElevatorState()!= ElevatorState.MAINTENANCE){
                if((dir==Direction.UP && floor>currFloor) || (dir==Direction.DOWN && floor<currFloor) ||
                        dir==Direction.IDLE){
                    int dist = Math.abs(floor-ele.getCurrFloor());
                    if(dist<minDist){
                        minDist=dist;
                        minEleId=ele.getId();
                    }
                }
            }
        }

        // random assignment if none found.
        if(minEleId==null)minEleId=elevators.get(0).getId();
        return minEleId;
    }
}
