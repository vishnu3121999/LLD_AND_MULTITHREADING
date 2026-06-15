package B_Strategy.datastore;

import B_Strategy.model.ParkingFloor;
import B_Strategy.model.ParkingLot;
import B_Strategy.model.ParkingSlot;
import B_Strategy.model.ParkingTicket;
import B_Strategy.model.Vehicle;

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

