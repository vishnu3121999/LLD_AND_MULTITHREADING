package A_basic.datastore;

        import A_basic.model.City;
import A_basic.model.Rider;
import A_basic.model.Driver;
import A_basic.model.Vehicle;
import A_basic.model.Ride;

        import java.util.HashMap;
        import java.util.Map;
import java.util.ArrayList;
import java.util.List;

        public class InMemoryDataStore implements DataStore {
            private final Map<String, City> cityMap;
    private final Map<String, Rider> riderMap;
    private final Map<String, Driver> driverMap;
    private final Map<String, Vehicle> vehicleMap;
    private final Map<String, Ride> rideMap;

            public InMemoryDataStore() {
                this.cityMap = new HashMap<>();
        this.riderMap = new HashMap<>();
        this.driverMap = new HashMap<>();
        this.vehicleMap = new HashMap<>();
        this.rideMap = new HashMap<>();
            }


            @Override
            public City getCity(String key) {
                return cityMap.get(key);
            }

            @Override
            public void putCity(String key, City value) {
                cityMap.put(key, value);
            }

            @Override
            public boolean containsCity(String key) {
                return cityMap.containsKey(key);
            }

            @Override
            public City removeCity(String key) {
                return cityMap.remove(key);
            }
            @Override
            public Rider getRider(String key) {
                return riderMap.get(key);
            }

            @Override
            public void putRider(String key, Rider value) {
                riderMap.put(key, value);
            }

            @Override
            public boolean containsRider(String key) {
                return riderMap.containsKey(key);
            }

            @Override
            public Rider removeRider(String key) {
                return riderMap.remove(key);
            }
            @Override
            public Driver getDriver(String key) {
                return driverMap.get(key);
            }

            @Override
            public void putDriver(String key, Driver value) {
                driverMap.put(key, value);
            }

            @Override
            public boolean containsDriver(String key) {
                return driverMap.containsKey(key);
            }

            @Override
            public Driver removeDriver(String key) {
                return driverMap.remove(key);
            }

            @Override
            public List<Driver> getDriverList() {
                return new ArrayList<>(driverMap.values());
            }
            @Override
            public Vehicle getVehicle(String key) {
                return vehicleMap.get(key);
            }

            @Override
            public void putVehicle(String key, Vehicle value) {
                vehicleMap.put(key, value);
            }

            @Override
            public boolean containsVehicle(String key) {
                return vehicleMap.containsKey(key);
            }

            @Override
            public Vehicle removeVehicle(String key) {
                return vehicleMap.remove(key);
            }
            @Override
            public Ride getRide(String key) {
                return rideMap.get(key);
            }

            @Override
            public void putRide(String key, Ride value) {
                rideMap.put(key, value);
            }

            @Override
            public boolean containsRide(String key) {
                return rideMap.containsKey(key);
            }

            @Override
            public Ride removeRide(String key) {
                return rideMap.remove(key);
            }
        }
