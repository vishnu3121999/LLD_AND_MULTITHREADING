package A_basic.datastore;

        import A_basic.model.City;
import A_basic.model.Rider;
import A_basic.model.Driver;
import A_basic.model.Vehicle;
import A_basic.model.Ride;
import java.util.List;

        public interface DataStore {

            City getCity(String key);

            void putCity(String key, City value);

            boolean containsCity(String key);

            City removeCity(String key);
            Rider getRider(String key);

            void putRider(String key, Rider value);

            boolean containsRider(String key);

            Rider removeRider(String key);
            Driver getDriver(String key);

            void putDriver(String key, Driver value);

            boolean containsDriver(String key);

            Driver removeDriver(String key);

            List<Driver> getDriverList();
            Vehicle getVehicle(String key);

            void putVehicle(String key, Vehicle value);

            boolean containsVehicle(String key);

            Vehicle removeVehicle(String key);
            Ride getRide(String key);

            void putRide(String key, Ride value);

            boolean containsRide(String key);

            Ride removeRide(String key);
        }
