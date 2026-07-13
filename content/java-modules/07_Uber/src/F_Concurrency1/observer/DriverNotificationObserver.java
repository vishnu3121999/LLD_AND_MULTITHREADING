package F_Concurrency1.observer;

import F_Concurrency1.model.Booking;
import F_Concurrency1.model.Driver;

public interface DriverNotificationObserver {
    void onRideRequested(Booking booking, Driver driver);
}
