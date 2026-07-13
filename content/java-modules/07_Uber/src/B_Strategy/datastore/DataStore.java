package B_Strategy.datastore;

import B_Strategy.model.Booking;
import B_Strategy.model.Cab;
import B_Strategy.model.Driver;
import B_Strategy.model.Rider;

import java.util.List;

public interface DataStore {
    Rider getRider(String key);

    void putRider(String key, Rider value);

    boolean containsRider(String key);

    Rider removeRider(String key);

    Driver getDriver(String key);

    void putDriver(String key, Driver value);

    boolean containsDriver(String key);

    Driver removeDriver(String key);

    Cab getCab(String key);

    void putCab(String key, Cab value);

    boolean containsCab(String key);

    Cab removeCab(String key);

    Booking getBooking(String key);

    void putBooking(String key, Booking value);

    boolean containsBooking(String key);

    Booking removeBooking(String key);

    List<Driver> getDriverList();

    List<Cab> getCabList();

    List<Booking> getBookingList();
}
