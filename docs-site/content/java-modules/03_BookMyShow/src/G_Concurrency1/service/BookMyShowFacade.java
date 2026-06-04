package G_Concurrency1.service;

import G_Concurrency1.datastore.DataStore;
import G_Concurrency1.model.City;
import G_Concurrency1.model.Movie;
import G_Concurrency1.model.Payment;
import G_Concurrency1.model.Screen;
import G_Concurrency1.model.Seat;
import G_Concurrency1.model.Show;
import G_Concurrency1.model.ShowSeat;
import G_Concurrency1.model.Theater;
import G_Concurrency1.model.Ticket;
import G_Concurrency1.model.enums.SeatStatus;
import G_Concurrency1.model.enums.SeatType;
import G_Concurrency1.model.enums.TicketStatus;
import G_Concurrency1.payment.PaymentProcessor;
import G_Concurrency1.pricing.PriceCalculator;

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
    private final Object catalogLock;

    public BookMyShowFacade(DataStore dataStore, PaymentProcessor paymentProcessor) {
        this.dataStore = dataStore;
        this.paymentProcessor = paymentProcessor;
        this.priceCalculator = new PriceCalculator(dataStore);
        this.catalogLock = new Object();
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

    public String selectSeats(String userId, String showId, List<String> showSeatList) {
        Show show = dataStore.getShow(showId);
        synchronized (show) {
            validateShowSeatsCanBeHeld(showSeatList);
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
        releaseExpiredHolds(ticket.getShowId());
        synchronized (ticket) {
            ticket.validateCanConfirm();
            validateShowSeatsCanBeBooked(ticket);
            if (Double.compare(payment.getAmount(), ticket.getPrice()) != 0) {
                throw new RuntimeException("Payment amount does not match ticket price");
            }
            if (!paymentProcessor.process(payment)) {
                throw new RuntimeException("Payment failed for ticket: " + ticketId);
            }
            for (String showSeatId : ticket.getShowSeatList()) {
                ShowSeat showSeat = dataStore.getShowSeat(showSeatId);
                showSeat.book();
            }
            ticket.confirm();

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

    private void validateShowSeatsCanBeBooked(Ticket ticket) {
        for (String showSeatId : ticket.getShowSeatList()) {
            ShowSeat showSeat = dataStore.getShowSeat(showSeatId);
            showSeat.validateCanBook();
        }
    }

    private void validateShowSeatsCanBeHeld(List<String> showSeatList) {
        for (String showSeatId : showSeatList) {
            ShowSeat showSeat = dataStore.getShowSeat(showSeatId);
            showSeat.validateCanHold();
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
        synchronized (catalogLock) {
            if (dataStore.containsCity(cityId)) {
                throw new RuntimeException("City already exists: " + cityId);
            }
            City city = new City(cityId, name);
            dataStore.putCity(city.getCityId(), city);
        }
    }

    public void addMovie(String movieId, String title) {
        synchronized (catalogLock) {
            if (dataStore.containsMovie(movieId)) {
                throw new RuntimeException("Movie already exists: " + movieId);
            }
            Movie movie = new Movie(movieId, title);
            dataStore.putMovie(movie.getMovieId(), movie);
        }
    }

    public void addTheater(String cityId, String theaterId, String name) {
        City city = dataStore.getCity(cityId);
        synchronized (catalogLock) {
            if (dataStore.containsTheater(theaterId)) {
                throw new RuntimeException("Theater already exists: " + theaterId);
            }
            Theater theater = new Theater(theaterId, name);

            dataStore.putTheater(theater.getTheaterId(), theater);
            city.addTheater(theaterId);
        }
    }

    public void addScreen(String theaterId, String screenId, String name) {
        Theater theater = dataStore.getTheater(theaterId);
        synchronized (catalogLock) {
            if (dataStore.containsScreen(screenId)) {
                throw new RuntimeException("Screen already exists: " + screenId);
            }
            Screen screen = new Screen(screenId, name);

            dataStore.putScreen(screen.getScreenId(), screen);
            theater.addScreen(screenId);
        }
    }

    public void addSeat(String screenId, String seatId, SeatType seatType) {
        Screen screen = dataStore.getScreen(screenId);
        synchronized (catalogLock) {
            if (dataStore.containsSeat(seatId)) {
                throw new RuntimeException("Seat already exists: " + seatId);
            }
            Seat seat = new Seat(seatId, seatType);
            dataStore.putSeat(seat.getSeatId(), seat);
            screen.addSeat(seatId);
        }
    }

    public void addShow(String showId, String movieId, String screenId, LocalDateTime startTime, int basePrice) {
        Screen screen = dataStore.getScreen(screenId);
        synchronized (catalogLock) {
            if (dataStore.containsShow(showId)) {
                throw new RuntimeException("Show already exists: " + showId);
            }
            Show show = new Show(showId, movieId, startTime);
            for (String seatId : screen.getSeatList()) {
                String showSeatId = showId + "-" + seatId;
                ShowSeat showSeat = new ShowSeat(
                        showSeatId,
                        seatId,
                        basePrice
                );
                dataStore.putShowSeat(showSeat.getShowSeatId(), showSeat);
            }
            screen.addShow(showId);
            dataStore.putShow(show.getShowId(), show);
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

