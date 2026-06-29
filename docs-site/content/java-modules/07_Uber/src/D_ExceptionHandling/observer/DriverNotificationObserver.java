package D_ExceptionHandling.observer;

import D_ExceptionHandling.model.Booking;
import D_ExceptionHandling.model.Driver;

public interface DriverNotificationObserver {
    void onRideRequested(Booking booking, Driver driver);
}
