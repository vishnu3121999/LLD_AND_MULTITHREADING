package org.example.services;

import org.example.enums.PaymentType;
import org.example.models.Ticket;

import java.time.LocalDateTime;
import java.util.List;

public class ServiceFacade {

    BookingService bookingService;
    AdminService adminService;
    SearchService searchService;
    PaymentService paymentService;
    public ServiceFacade(AdminService adminService, BookingService bookingService, SearchService searchService) {
        this.adminService = adminService;
        this.bookingService = bookingService;
        this.searchService = searchService;
    }

    public String addTheater(String city , List<String> screens){
        return adminService.addTheater(city,screens);
    }

    public String addScreen(String theaterId, List<String> shows){
        return adminService.addScreen(theaterId, shows);
    }

    public String addShow(String screenId, String movie, String theaterId, LocalDateTime startTime, List<String> seats) {
        return adminService.addShow(screenId,movie,theaterId,startTime,seats);
    }

    public String addSeat(String showId){
        return adminService.addSeat(showId);
    }

    public String bookTicket(String userId, String showId, List<String> seatIds){
        return bookingService.bookTicket(userId,showId,seatIds);
    }

    public List<String> getTheatersByMovieAndCity(String movie,String city){
        return searchService.getTheatersByMovieAndCity(movie,city);
    }

    // UI will show this method to user only during the lockExpiry window -
    // so no need to do validations on whether locks are exipred or not during payment
    // Locks just to prevent others from selecting same seats again
    public Ticket pay(PaymentType paymentType,String ticketId) {
        return paymentService.pay(paymentType,ticketId);
    }
}
