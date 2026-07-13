package F_Concurrency2.model;

import F_Concurrency2.observer.ElevatorObserver;

import java.util.Objects;

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

    @Override
    public boolean equals(Object object) {
        if (this == object) {
            return true;
        }
        if (!(object instanceof Display)) {
            return false;
        }
        Display display = (Display) object;
        return Objects.equals(displayId, display.displayId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(displayId);
    }
}
