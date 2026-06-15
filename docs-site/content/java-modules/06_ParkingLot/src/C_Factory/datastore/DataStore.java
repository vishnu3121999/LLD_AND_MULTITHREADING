package C_Factory.datastore;

import C_Factory.model.ParkingFloor;
import C_Factory.model.ParkingLot;
import C_Factory.model.ParkingSlot;
import C_Factory.model.ParkingTicket;
import C_Factory.model.Vehicle;

public interface DataStore {
    ParkingLot getParkingLot(String key);

    void putParkingLot(String key, ParkingLot value);

    boolean containsParkingLot(String key);

    ParkingLot removeParkingLot(String key);

    ParkingFloor getParkingFloor(String key);

    void putParkingFloor(String key, ParkingFloor value);

    boolean containsParkingFloor(String key);

    ParkingFloor removeParkingFloor(String key);

    ParkingSlot getParkingSlot(String key);

    void putParkingSlot(String key, ParkingSlot value);

    boolean containsParkingSlot(String key);

    ParkingSlot removeParkingSlot(String key);

    Vehicle getVehicle(String key);

    void putVehicle(String key, Vehicle value);

    boolean containsVehicle(String key);

    Vehicle removeVehicle(String key);

    ParkingTicket getParkingTicket(String key);

    void putParkingTicket(String key, ParkingTicket value);

    boolean containsParkingTicket(String key);

    ParkingTicket removeParkingTicket(String key);
}


