package C_Observer.model;

public class Driver {
    private final String driverId;
    private final String name;
    private final String cabId;

    public Driver(String driverId, String name, String cabId) {
        this.driverId = driverId;
        this.name = name;
        this.cabId = cabId;
    }

    public String getDriverId() {
        return driverId;
    }

    public String getName() {
        return name;
    }

    public String getCabId() {
        return cabId;
    }

    @Override
    public String toString() {
        return "Driver{" +
                "driverId='" + driverId + '\'' +
                ", name='" + name + '\'' +
                ", cabId='" + cabId + '\'' +
                '}';
    }
}
