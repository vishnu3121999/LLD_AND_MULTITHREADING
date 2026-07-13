package database;

import model.Booking;
import model.Rider;
import model.Vehicle;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class DataStore {
    Map<String, Booking> bookingMap;
    Map<String, Rider> riderMap;
    Map<String, Vehicle> vehicleMap;

    public DataStore() {
        this.bookingMap = new ConcurrentHashMap<>();
        this.riderMap = new ConcurrentHashMap<>();
        this.vehicleMap = new ConcurrentHashMap<>();
    }
    
    public Vehicle getVehicle(String key) {
        return vehicleMap.get(key);
    }
    
    public void putVehicle(String key, Vehicle value) {
        vehicleMap.put(key, value);
    }
    
    public boolean containsVehicle(String key) {
        return vehicleMap.containsKey(key);
    }
    
    
    public Rider getRider(String key) {
        return riderMap.get(key);
    }
    
    public void putRider(String key, Rider value) {
        riderMap.put(key, value);
    }
    
    public boolean containsRider(String key) {
        return riderMap.containsKey(key);
    }
    
    public Booking getBooking(String key) {
        return bookingMap.get(key);
    }
    
    public void putBooking(String key, Booking value) {
        bookingMap.put(key, value);
    }
    
    public boolean containsBooking(String key) {
        return bookingMap.containsKey(key);
    }

    public Map<String, Vehicle> getVehicleMap() {
        return vehicleMap;
    }
}
