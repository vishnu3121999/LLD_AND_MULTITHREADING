package E_ExceptionHandlingV2.datastore;

import E_ExceptionHandlingV2.model.City;
import E_ExceptionHandlingV2.model.Movie;
import E_ExceptionHandlingV2.model.Screen;
import E_ExceptionHandlingV2.model.Seat;
import E_ExceptionHandlingV2.model.Show;
import E_ExceptionHandlingV2.model.ShowSeat;
import E_ExceptionHandlingV2.model.Theater;
import E_ExceptionHandlingV2.model.Ticket;

import java.util.List;

public interface DataStore {
    City getCity(String key);

    void putCity(String key, City value);

    boolean containsCity(String key);

    City removeCity(String key);

    List<City> getCityList();

    Movie getMovie(String key);

    void putMovie(String key, Movie value);

    boolean containsMovie(String key);

    Movie removeMovie(String key);

    List<Movie> getMovieList();

    Theater getTheater(String key);

    void putTheater(String key, Theater value);

    boolean containsTheater(String key);

    Theater removeTheater(String key);

    List<Theater> getTheaterList();

    Screen getScreen(String key);

    void putScreen(String key, Screen value);

    boolean containsScreen(String key);

    Screen removeScreen(String key);

    List<Screen> getScreenList();

    Show getShow(String key);

    void putShow(String key, Show value);

    boolean containsShow(String key);

    Show removeShow(String key);

    List<Show> getShowList();

    Seat getSeat(String key);

    void putSeat(String key, Seat value);

    boolean containsSeat(String key);

    Seat removeSeat(String key);

    List<Seat> getSeatList();

    ShowSeat getShowSeat(String key);

    void putShowSeat(String key, ShowSeat value);

    boolean containsShowSeat(String key);

    ShowSeat removeShowSeat(String key);

    List<ShowSeat> getShowSeatList();

    Ticket getTicket(String key);

    void putTicket(String key, Ticket value);

    boolean containsTicket(String key);

    Ticket removeTicket(String key);

    List<Ticket> getTicketList();
}
