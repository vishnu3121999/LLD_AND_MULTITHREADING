package org.example.services;

import org.example.database.State;
import org.example.models.Seat;
import org.example.models.Show;
import org.example.models.Theater;

import java.util.ArrayList;
import java.util.List;

public class SearchService {
    State state;

    public SearchService(State state) {
        this.state = state;
    }


    List<Theater> getTheatersByCity(String city){
        return state.getTheaters().values().stream().parallel()
                .filter((theater)->theater.getCity().equals(city)).toList();
    }

    List<String> getTheatersByMovieAndCity(String movie,String city){
        return state.getShows().values().parallelStream()
                .filter((show)->show.getMovieId().equals(movie) && state.getTheaters().get(show.getTheaterId()).getCity().equals(city))
                .map(Show::getTheaterId)
                .toList();
    }


    // can give wrong results sometimes, if some seats are being locked by another thread
    // To make it completely correct, we need to lock the showLock during read as well
    public List<Seat> showAllFreeSeatsForShow(String showId){
        List<String> seatsList = state.getShows().get(showId).getSeats();
        ArrayList<Seat> result = new ArrayList<>();
        for(String seatId:seatsList){
            Seat seat = state.getSeats().get(seatId);
            if(seat.isSeatFree())result.add(seat);
        }
        return result;
    }

}
