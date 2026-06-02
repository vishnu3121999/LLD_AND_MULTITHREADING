package org.example;

import org.example.database.State;
import org.example.models.User;
import org.example.services.AdminService;
import org.example.services.BookingService;
import org.example.services.SearchService;
import org.example.services.ServiceFacade;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

public class Main {
    public static void main(String[] args) {

        // create state,services,design-patterns etc   -- will be created by DI spring
        State state = new State();
        AdminService adminService = new AdminService(state);
        BookingService bookingService = new BookingService(state);
        SearchService searchService = new SearchService(state);

        ServiceFacade serviceFacade = new ServiceFacade(adminService,bookingService,searchService);

        // external-apis : Admin
        var theaterId1 = serviceFacade.addTheater("HYD",new ArrayList<>());

        var t1s1 = serviceFacade.addScreen(theaterId1,new ArrayList<>());

        var t1s1show1 = serviceFacade.addShow(t1s1,"Avatar",theaterId1, LocalDateTime.of(2025,12,1,8,0), new ArrayList<>());
        var t1s1show2 = serviceFacade.addShow(t1s1,"RRR",theaterId1, LocalDateTime.of(2025,12,1,12,0), new ArrayList<>());

        var seat1 = serviceFacade.addSeat(t1s1show1);
        var seat2 = serviceFacade.addSeat(t1s1show1);

        var seat3 = serviceFacade.addSeat(t1s1show2);
        var seat4 = serviceFacade.addSeat(t1s1show2);

        // external-apis : User
        User user1 = new User(UUID.randomUUID().toString());

        var theatersList = serviceFacade.getTheatersByMovieAndCity("Avatar","HYD");
        System.out.println(theatersList);

        var ticket1 = serviceFacade.bookTicket(user1.getId(),t1s1show1,List.of(seat1));
        var ticket2 = serviceFacade.bookTicket(user1.getId(),t1s1show2,List.of(seat3,seat4));


    }
}