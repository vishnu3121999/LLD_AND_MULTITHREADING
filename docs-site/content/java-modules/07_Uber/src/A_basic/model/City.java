package A_basic.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class City {
    private final String cityId;
    private final String name;
    private final List<String> riderList;
    private final List<String> driverList;

    public City(String cityId, String name) {
        this.cityId = cityId;
        this.name = name;
        this.riderList = new ArrayList<>();
        this.driverList = new ArrayList<>();
    }

    public void addRider(String riderId) { riderList.add(riderId); }
    public void addDriver(String driverId) { driverList.add(driverId); }
    @Override public String toString() { return "City{" + "cityId='" + cityId + "'" + ", name='" + name + "'" + ", riderList=" + riderList + ", driverList=" + driverList + '}'; }
    public String getCityId() { return cityId; }
    public String getName() { return name; }
    public List<String> getRiderList() { return Collections.unmodifiableList(riderList); }
    public List<String> getDriverList() { return Collections.unmodifiableList(driverList); }
}
