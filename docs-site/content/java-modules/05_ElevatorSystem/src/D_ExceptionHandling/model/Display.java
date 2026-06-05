package D_ExceptionHandling.model;

import D_ExceptionHandling.observer.ElevatorObserver;

public class Display implements ElevatorObserver {
    private final String displayId;
    private final int floor;

    public Display(String displayId, int floor) {
        this.displayId = displayId;
        this.floor = floor;
    }

    @Override
    public void update(Elevator elevator) {
        System.out.println("Display{" +
                "displayId='" + displayId + '\'' +
                ", floor=" + floor +
                "} shows elevatorFloor=" + elevator.getCurrentFloor());
    }

    @Override
    public String toString() {
        return "Display{" +
                "displayId='" + displayId + '\'' +
                ", floor=" + floor +
                '}';
    }

    public String getDisplayId() {
        return displayId;
    }

    public int getFloor() {
        return floor;
    }
}
