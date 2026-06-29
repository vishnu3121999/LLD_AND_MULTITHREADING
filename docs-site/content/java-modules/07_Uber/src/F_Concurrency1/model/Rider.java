package F_Concurrency1.model;

public class Rider {
    private final String riderId;
    private final String name;
    private Location currentLocation;

    public Rider(String riderId, String name, Location currentLocation) {
        this.riderId = riderId;
        this.name = name;
        this.currentLocation = currentLocation;
    }

    public void updateLocation(Location currentLocation) {
        this.currentLocation = currentLocation;
    }

    public String getRiderId() {
        return riderId;
    }

    public String getName() {
        return name;
    }

    public Location getCurrentLocation() {
        return currentLocation;
    }

    @Override
    public String toString() {
        return "Rider{" +
                "riderId='" + riderId + '\'' +
                ", name='" + name + '\'' +
                ", currentLocation=" + currentLocation +
                '}';
    }
}
