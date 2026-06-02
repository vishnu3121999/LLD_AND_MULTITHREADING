package F_Concurrency.service;

import F_Concurrency.datastore.DataStore;
import F_Concurrency.model.City;
import F_Concurrency.model.Movie;
import F_Concurrency.model.Payment;
import F_Concurrency.model.Screen;
import F_Concurrency.model.Seat;
import F_Concurrency.model.Show;
import F_Concurrency.model.ShowSeat;
import F_Concurrency.model.Theater;
import F_Concurrency.model.Ticket;
import F_Concurrency.model.enums.SeatStatus;
import F_Concurrency.model.enums.SeatType;
import F_Concurrency.model.enums.TicketStatus;
import F_Concurrency.payment.PaymentProcessor;
import F_Concurrency.pricing.PriceCalculator;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class BookMyShowFacade {
    private static final Duration DEFAULT_HOLD_DURATION = Duration.ofMinutes(5);

    private final DataStore dataStore;
    private final PaymentProcessor paymentProcessor;
    private final PriceCalculator priceCalculator;

    public BookMyShowFacade(DataStore dataStore, PaymentProcessor paymentProcessor) {
        this.dataStore = dataStore;
        this.paymentProcessor = paymentProcessor;
        this.priceCalculator = new PriceCalculator(dataStore);
    }

    // User methods

    public List<Show> searchShows(String movieTitle, String cityId) {
        City city = dataStore.getCity(cityId);
        List<Show> result = new ArrayList<>();
        for (String theaterId : city.getTheaterList()) {
            Theater theater = dataStore.getTheater(theaterId);
            for (String screenId : theater.getScreenList()) {
                Screen screen = dataStore.getScreen(screenId);
                addMatchingShows(movieTitle, screen, result);
            }
        }
        return result;
    }

    public List<ShowSeat> getSeatsForShow(String showId) {
        Show show = dataStore.getShow(showId);
        synchronized (show) {
            releaseExpiredHolds(show.getShowId());

            List<ShowSeat> result = new ArrayList<>();
            for (ShowSeat showSeat : dataStore.getShowSeatList()) {
                if (isShowSeatForShow(show.getShowId(), showSeat.getShowSeatId())) {
                    result.add(showSeat);
                }
            }
            calculatePricesForAvailableShowSeats(show, result);
            return result;
        }
    }

    public String selectSeats(String userId, String showId, List<String> showSeatList) {
        Show show = dataStore.getShow(showId);
        synchronized (show) {
            LocalDateTime now = LocalDateTime.now();
            String ticketId = "ticket-" + UUID.randomUUID();
            LocalDateTime expiresAt = now.plus(DEFAULT_HOLD_DURATION);
            Ticket ticket = new Ticket(
                    ticketId,
                    userId,
                    showId,
                    showSeatList,
                    TicketStatus.PENDING_PAYMENT,
                    now,
                    expiresAt
            );

            holdSeats(showSeatList);
            dataStore.putTicket(ticket.getTicketId(), ticket);
            priceCalculator.calculateTicketPrice(ticket);
            return ticketId;
        }
    }

    public Ticket pay(String ticketId, Payment payment) {
        Ticket ticket = dataStore.getTicket(ticketId);
        Show show = dataStore.getShow(ticket.getShowId());
        synchronized (show) {
            releaseExpiredHolds(show.getShowId());

            if (paymentProcessor.process(payment)) {
                for (String showSeatId : ticket.getShowSeatList()) {
                    ShowSeat showSeat = dataStore.getShowSeat(showSeatId);
                    showSeat.book();
                }
                ticket.confirm();
            }
            return ticket;
        }
    }

    public Ticket getTicket(String ticketId) {
        return dataStore.getTicket(ticketId);
    }

    // System methods

    private void releaseExpiredHolds(String showId) {
        LocalDateTime now = LocalDateTime.now();
        for (Ticket ticket : dataStore.getTicketList()) {
            if (ticket.getShowId().equals(showId) && ticket.isExpired(now)) {
                ticket.expire();
                for (String showSeatId : ticket.getShowSeatList()) {
                    ShowSeat showSeat = dataStore.getShowSeat(showSeatId);
                    if (showSeat.getSeatStatus() == SeatStatus.HELD) {
                        showSeat.releaseHold();
                    }
                }
            }
        }
    }

    private void holdSeats(List<String> showSeatList) {
        for (String showSeatId : showSeatList) {
            ShowSeat showSeat = dataStore.getShowSeat(showSeatId);
            showSeat.hold();
        }
    }

    private void calculatePricesForAvailableShowSeats(Show show, List<ShowSeat> showSeatList) {
        for (ShowSeat showSeat : showSeatList) {
            if (showSeat.getSeatStatus() == SeatStatus.AVAILABLE) {
                showSeat.updatePrice(calculateShowSeatPrice(show, showSeat));
            }
        }
    }

    // Admin add methods

    public void addCity(String cityId, String name) {
        synchronized (dataStore) {
            if (dataStore.containsCity(cityId)) {
                throw new IllegalStateException("City already exists: " + cityId);
            }

            City city = new City(cityId, name);
            dataStore.putCity(city.getCityId(), city);
        }
    }

    public void addMovie(String movieId, String title) {
        synchronized (dataStore) {
            if (dataStore.containsMovie(movieId)) {
                throw new IllegalStateException("Movie already exists: " + movieId);
            }

            Movie movie = new Movie(movieId, title);
            dataStore.putMovie(movie.getMovieId(), movie);
        }
    }

    public void addTheater(String cityId, String theaterId, String name) {
        synchronized (dataStore) {
            if (dataStore.containsTheater(theaterId)) {
                throw new IllegalStateException("Theater already exists: " + theaterId);
            }
            City city = dataStore.getCity(cityId);

            Theater theater = new Theater(theaterId, name);
            dataStore.putTheater(theater.getTheaterId(), theater);
            city.addTheater(theaterId);
        }
    }

    public void addScreen(String theaterId, String screenId, String name) {
        synchronized (dataStore) {
            if (dataStore.containsScreen(screenId)) {
                throw new IllegalStateException("Screen already exists: " + screenId);
            }
            Theater theater = dataStore.getTheater(theaterId);

            Screen screen = new Screen(screenId, name);
            dataStore.putScreen(screen.getScreenId(), screen);
            theater.addScreen(screenId);
        }
    }

    public void addSeat(String screenId, String seatId, SeatType seatType) {
        synchronized (dataStore) {
            if (dataStore.containsSeat(seatId)) {
                throw new IllegalStateException("Seat already exists: " + seatId);
            }
            Screen screen = dataStore.getScreen(screenId);

            Seat seat = new Seat(seatId, seatType);
            dataStore.putSeat(seat.getSeatId(), seat);
            screen.addSeat(seatId);
        }
    }

    public void addShow(String showId, String movieId, String screenId, LocalDateTime startTime, int basePrice) {
        synchronized (dataStore) {
            if (dataStore.containsShow(showId)) {
                throw new IllegalStateException("Show already exists: " + showId);
            }
            Screen screen = dataStore.getScreen(screenId);

            Show show = new Show(showId, movieId, startTime);
            for (String seatId : screen.getSeatList()) {
                String showSeatId = showId + "-" + seatId;
                if (dataStore.containsShowSeat(showSeatId)) {
                    throw new IllegalStateException("Show seat already exists: " + showSeatId);
                }
                ShowSeat showSeat = new ShowSeat(
                        showSeatId,
                        seatId,
                        basePrice
                );
                dataStore.putShowSeat(showSeat.getShowSeatId(), showSeat);
            }
            dataStore.putShow(show.getShowId(), show);
            screen.addShow(showId);
        }
    }

    // Util/helper methods

    private void addMatchingShows(String movieTitle, Screen screen, List<Show> result) {
        for (String showId : screen.getShowList()) {
            Show show = dataStore.getShow(showId);
            Movie movie = dataStore.getMovie(show.getMovieId());
            if (movie.getTitle().equalsIgnoreCase(movieTitle)) {
                result.add(show);
            }
        }
    }

    private boolean isShowSeatForShow(String showId, String showSeatId) {
        return showSeatId.startsWith(showId + "-");
    }

    private int calculateShowSeatPrice(Show show, ShowSeat showSeat) {
        Seat seat = dataStore.getSeat(showSeat.getSeatId());
        return priceCalculator.calculateShowSeatPrice(showSeat.getBasePrice(), seat.getSeatType(), show.getStartTime());
    }

}
