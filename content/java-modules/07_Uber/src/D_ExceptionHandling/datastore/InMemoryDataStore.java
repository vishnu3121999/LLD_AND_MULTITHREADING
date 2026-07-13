package D_ExceptionHandling.datastore;

import D_ExceptionHandling.model.Booking;
import D_ExceptionHandling.model.Cab;
import D_ExceptionHandling.model.Driver;
import D_ExceptionHandling.model.Rider;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class InMemoryDataStore implements DataStore {
    private final Map<String, Rider> riderMap;
    private final Map<String, Driver> driverMap;
    private final Map<String, Cab> cabMap;
    private final Map<String, Booking> bookingMap;

    public InMemoryDataStore() {
        this.riderMap = new HashMap<>();
        this.driverMap = new HashMap<>();
        this.cabMap = new HashMap<>();
        this.bookingMap = new HashMap<>();
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
    public Cab getCab(String key) {
        return cabMap.get(key);
    }

    @Override
    public void putCab(String key, Cab value) {
        cabMap.put(key, value);
    }

    @Override
    public boolean containsCab(String key) {
        return cabMap.containsKey(key);
    }

    @Override
    public Cab removeCab(String key) {
        return cabMap.remove(key);
    }

    @Override
    public Booking getBooking(String key) {
        return bookingMap.get(key);
    }

    @Override
    public void putBooking(String key, Booking value) {
        bookingMap.put(key, value);
    }

    @Override
    public boolean containsBooking(String key) {
        return bookingMap.containsKey(key);
    }

    @Override
    public Booking removeBooking(String key) {
        return bookingMap.remove(key);
    }

    @Override
    public List<Driver> getDriverList() {
        return new ArrayList<>(driverMap.values());
    }

    @Override
    public List<Cab> getCabList() {
        return new ArrayList<>(cabMap.values());
    }

    @Override
    public List<Booking> getBookingList() {
        return new ArrayList<>(bookingMap.values());
    }
}
