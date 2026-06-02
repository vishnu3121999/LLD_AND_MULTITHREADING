package A_basicSeatHoldBooking.service;

import A_basicSeatHoldBooking.datastore.DataStore;
import A_basicSeatHoldBooking.model.City;
import A_basicSeatHoldBooking.model.Movie;
import A_basicSeatHoldBooking.model.Payment;
import A_basicSeatHoldBooking.model.Screen;
import A_basicSeatHoldBooking.model.Seat;
import A_basicSeatHoldBooking.model.Show;
import A_basicSeatHoldBooking.model.ShowSeat;
import A_basicSeatHoldBooking.model.Theater;
import A_basicSeatHoldBooking.model.Ticket;
import A_basicSeatHoldBooking.model.enums.SeatStatus;
import A_basicSeatHoldBooking.model.enums.SeatType;
import A_basicSeatHoldBooking.model.enums.TicketStatus;
import A_basicSeatHoldBooking.payment.PaymentProcessor;
import A_basicSeatHoldBooking.pricing.PriceCalculator;

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
        releaseExpiredHolds(showId);

        Show show = dataStore.getShow(showId);
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
        dataStore.putTicket(ticket.getTicketId(), ticket);

        holdSeats(showSeatList);
        priceCalculator.calculateTicketPrice(ticket);
        return ticketId;
    }

    public Ticket pay(String ticketId, Payment payment) {
        Ticket ticket = dataStore.getTicket(ticketId);
        releaseExpiredHolds(ticket.getShowId());

        if (paymentProcessor.process(payment)) {
            for (String showSeatId : ticket.getShowSeatList()) {
                ShowSeat showSeat = dataStore.getShowSeat(showSeatId);
                showSeat.book();
            }
            ticket.confirm();
        }

        return ticket;
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
        City city = new City(cityId, name);
        dataStore.putCity(city.getCityId(), city);
    }

    public void addMovie(String movieId, String title) {
        Movie movie = new Movie(movieId, title);
        dataStore.putMovie(movie.getMovieId(), movie);
    }

    public void addTheater(String cityId, String theaterId, String name) {
        City city = dataStore.getCity(cityId);
        Theater theater = new Theater(theaterId, name);

        dataStore.putTheater(theater.getTheaterId(), theater);
        city.addTheater(theaterId);
    }

    public void addScreen(String theaterId, String screenId, String name) {
        Theater theater = dataStore.getTheater(theaterId);
        Screen screen = new Screen(screenId, name);

        dataStore.putScreen(screen.getScreenId(), screen);
        theater.addScreen(screenId);
    }

    public void addSeat(String screenId, String seatId, SeatType seatType) {
        Screen screen = dataStore.getScreen(screenId);
        Seat seat = new Seat(seatId, seatType);
        dataStore.putSeat(seat.getSeatId(), seat);
        screen.addSeat(seatId);
    }

    public void addShow(String showId, String movieId, String screenId, LocalDateTime startTime, int basePrice) {
        Screen screen = dataStore.getScreen(screenId);
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
