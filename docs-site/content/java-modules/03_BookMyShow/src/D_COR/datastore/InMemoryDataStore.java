package D_COR.datastore;

import D_COR.model.City;
import D_COR.model.Movie;
import D_COR.model.Screen;
import D_COR.model.Seat;
import D_COR.model.Show;
import D_COR.model.ShowSeat;
import D_COR.model.Theater;
import D_COR.model.Ticket;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class InMemoryDataStore implements DataStore {
    private final Map<String, City> cityMap;
    private final Map<String, Movie> movieMap;
    private final Map<String, Theater> theaterMap;
    private final Map<String, Screen> screenMap;
    private final Map<String, Show> showMap;
    private final Map<String, Seat> seatMap;
    private final Map<String, ShowSeat> showSeatMap;
    private final Map<String, Ticket> ticketMap;

    public InMemoryDataStore() {
        this.cityMap = new HashMap<>();
        this.movieMap = new HashMap<>();
        this.theaterMap = new HashMap<>();
        this.screenMap = new HashMap<>();
        this.showMap = new HashMap<>();
        this.seatMap = new HashMap<>();
        this.showSeatMap = new HashMap<>();
        this.ticketMap = new HashMap<>();
    }

    @Override
    public City getCity(String key) {
        return cityMap.get(key);
    }

    @Override
    public void putCity(String key, City value) {
        cityMap.put(key, value);
    }

    @Override
    public boolean containsCity(String key) {
        return cityMap.containsKey(key);
    }

    @Override
    public City removeCity(String key) {
        return cityMap.remove(key);
    }

    @Override
    public List<City> getCityList() {
        return new ArrayList<>(cityMap.values());
    }

    @Override
    public Movie getMovie(String key) {
        return movieMap.get(key);
    }

    @Override
    public void putMovie(String key, Movie value) {
        movieMap.put(key, value);
    }

    @Override
    public boolean containsMovie(String key) {
        return movieMap.containsKey(key);
    }

    @Override
    public Movie removeMovie(String key) {
        return movieMap.remove(key);
    }

    @Override
    public List<Movie> getMovieList() {
        return new ArrayList<>(movieMap.values());
    }

    @Override
    public Theater getTheater(String key) {
        return theaterMap.get(key);
    }

    @Override
    public void putTheater(String key, Theater value) {
        theaterMap.put(key, value);
    }

    @Override
    public boolean containsTheater(String key) {
        return theaterMap.containsKey(key);
    }

    @Override
    public Theater removeTheater(String key) {
        return theaterMap.remove(key);
    }

    @Override
    public List<Theater> getTheaterList() {
        return new ArrayList<>(theaterMap.values());
    }

    @Override
    public Screen getScreen(String key) {
        return screenMap.get(key);
    }

    @Override
    public void putScreen(String key, Screen value) {
        screenMap.put(key, value);
    }

    @Override
    public boolean containsScreen(String key) {
        return screenMap.containsKey(key);
    }

    @Override
    public Screen removeScreen(String key) {
        return screenMap.remove(key);
    }

    @Override
    public List<Screen> getScreenList() {
        return new ArrayList<>(screenMap.values());
    }

    @Override
    public Show getShow(String key) {
        return showMap.get(key);
    }

    @Override
    public void putShow(String key, Show value) {
        showMap.put(key, value);
    }

    @Override
    public boolean containsShow(String key) {
        return showMap.containsKey(key);
    }

    @Override
    public Show removeShow(String key) {
        return showMap.remove(key);
    }

    @Override
    public List<Show> getShowList() {
        return new ArrayList<>(showMap.values());
    }

    @Override
    public Seat getSeat(String key) {
        return seatMap.get(key);
    }

    @Override
    public void putSeat(String key, Seat value) {
        seatMap.put(key, value);
    }

    @Override
    public boolean containsSeat(String key) {
        return seatMap.containsKey(key);
    }

    @Override
    public Seat removeSeat(String key) {
        return seatMap.remove(key);
    }

    @Override
    public List<Seat> getSeatList() {
        return new ArrayList<>(seatMap.values());
    }

    @Override
    public ShowSeat getShowSeat(String key) {
        return showSeatMap.get(key);
    }

    @Override
    public void putShowSeat(String key, ShowSeat value) {
        showSeatMap.put(key, value);
    }

    @Override
    public boolean containsShowSeat(String key) {
        return showSeatMap.containsKey(key);
    }

    @Override
    public ShowSeat removeShowSeat(String key) {
        return showSeatMap.remove(key);
    }

    @Override
    public List<ShowSeat> getShowSeatList() {
        return new ArrayList<>(showSeatMap.values());
    }

    @Override
    public Ticket getTicket(String key) {
        return ticketMap.get(key);
    }

    @Override
    public void putTicket(String key, Ticket value) {
        ticketMap.put(key, value);
    }

    @Override
    public boolean containsTicket(String key) {
        return ticketMap.containsKey(key);
    }

    @Override
    public Ticket removeTicket(String key) {
        return ticketMap.remove(key);
    }

    @Override
    public List<Ticket> getTicketList() {
        return new ArrayList<>(ticketMap.values());
    }
}
