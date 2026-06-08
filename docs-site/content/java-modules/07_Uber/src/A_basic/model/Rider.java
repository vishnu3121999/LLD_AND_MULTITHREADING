package A_basic.model;

public class Rider {
    private final String riderId;
    private final String name;

    public Rider(String riderId, String name) { this.riderId = riderId; this.name = name; }
    @Override public String toString() { return "Rider{" + "riderId='" + riderId + "'" + ", name='" + name + "'" + '}'; }
    public String getRiderId() { return riderId; }
    public String getName() { return name; }
}
