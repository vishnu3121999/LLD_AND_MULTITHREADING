package org.example.services;

import org.example.database.State;
import org.example.enums.SeatStatus;
import org.example.locks.LockManager;
import org.example.models.Screen;
import org.example.models.Seat;
import org.example.models.Show;
import org.example.models.Theater;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class AdminService {
    State state;

    public AdminService(State state) {
        this.state = state;
    }

    String addTheater(String city , List<String> screens){

        String theaterId = UUID.randomUUID().toString();
        Theater theater = new Theater(theaterId,city,screens);
        state.getTheaters().put(theaterId,theater);

        return theaterId;
    }

    String addShow(String screenId, String movie, String theaterId, LocalDateTime startTime, List<String> seats){
        String showId = UUID.randomUUID().toString();
        Show show = new Show(screenId,movie,theaterId,startTime,seats);

        state.getShows().put(showId, show);
        state.getScreens().get(screenId).getShowList().add(showId);
        LockManager.addLockForShow(showId);

        return showId;
    }

    String addScreen(String theaterId, List<String> shows){
        String screenId = UUID.randomUUID().toString();
        Screen screen = new Screen(screenId,shows);
        state.getScreens().put(screenId,screen);
        state.getTheaters().get(theaterId).getScreenList().add(screenId);

        return screenId;
    }

    String addSeat(String showId){
        String seatId = UUID.randomUUID().toString();
        Seat seat = new Seat(seatId, SeatStatus.FREE,600);
        state.getShows().get(showId).getSeats().add(seatId);
        state.getSeats().put(seatId,seat);

        return seatId;
    }


}
