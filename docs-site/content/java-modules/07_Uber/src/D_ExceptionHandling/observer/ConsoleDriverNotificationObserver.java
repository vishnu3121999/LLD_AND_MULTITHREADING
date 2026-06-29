package D_ExceptionHandling.observer;

import D_ExceptionHandling.model.Booking;
import D_ExceptionHandling.model.Driver;

public class ConsoleDriverNotificationObserver implements DriverNotificationObserver {
    @Override
    public void onRideRequested(Booking booking, Driver driver) {
        System.out.println("Notification sent to driver " + driver.getName()
                + " for booking " + booking.getBookingId());
    }

    @Override
    public boolean equals(Object object) {
        return object instanceof ConsoleDriverNotificationObserver;
    }

    @Override
    public int hashCode() {
        return ConsoleDriverNotificationObserver.class.hashCode();
    }
}
