package A_basic.model;

public class Display {
    private final String displayId;
    private final int floor;

    public Display(String displayId, int floor) {
        this.displayId = displayId;
        this.floor = floor;
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
