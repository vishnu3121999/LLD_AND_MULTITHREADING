package D_ExceptionHandling.datastore;

import D_ExceptionHandling.model.ParkingFloor;
import D_ExceptionHandling.model.ParkingLot;
import D_ExceptionHandling.model.ParkingSlot;
import D_ExceptionHandling.model.ParkingTicket;
import D_ExceptionHandling.model.Vehicle;

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



