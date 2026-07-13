package G_Concurrency2.observer;

import G_Concurrency2.model.Booking;
import G_Concurrency2.model.Driver;

public interface DriverNotificationObserver {
    void onRideRequested(Booking booking, Driver driver);
}
