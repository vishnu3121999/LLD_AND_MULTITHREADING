package H_Concurrency2.service;

import H_Concurrency2.datastore.DataStore;
import H_Concurrency2.model.City;
import H_Concurrency2.model.CreditCardPayment;
import H_Concurrency2.model.Movie;
import H_Concurrency2.model.Payment;
import H_Concurrency2.model.Screen;
import H_Concurrency2.model.Seat;
import H_Concurrency2.model.Show;
import H_Concurrency2.model.ShowSeat;
import H_Concurrency2.model.Theater;
import H_Concurrency2.model.Ticket;
import H_Concurrency2.model.UPIPayment;
import H_Concurrency2.model.enums.SeatStatus;
import H_Concurrency2.model.enums.SeatType;
import H_Concurrency2.model.enums.TicketStatus;
import H_Concurrency2.payment.PaymentProcessor;
import H_Concurrency2.pricing.PriceCalculator;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;

public class BookMyShowFacade {
    private static final Duration DEFAULT_HOLD_DURATION = Duration.ofMinutes(5);

    private final DataStore dataStore;
    private final PaymentProcessor paymentProcessor;
    private final PriceCalculator priceCalculator;
    private final Object catalogLock;
    private final ShowSeatLockManager showSeatLockManager;

    public BookMyShowFacade(DataStore dataStore, PaymentProcessor paymentProcessor) {
        this.dataStore = dataStore;
        this.paymentProcessor = paymentProcessor;
        this.priceCalculator = new PriceCalculator(dataStore);
        this.catalogLock = new Object();
        this.showSeatLockManager = new ShowSeatLockManager();
    }

    // User methods

    public List<Show> searchShows(String movieTitle, String cityId) {
        requireText(movieTitle, "movieTitle");
        City city = getRequiredCity(cityId);
        List<Show> result = new ArrayList<>();
        for (String theaterId : city.getTheaterList()) {
            Theater theater = getRequiredTheater(theaterId);
            for (String screenId : theater.getScreenList()) {
                Screen screen = getRequiredScreen(screenId);
                addMatchingShows(movieTitle, screen, result);
            }
        }
        return result;
    }

    public List<ShowSeat> getSeatsForShow(String showId) {
        Show show = getRequiredShow(showId);
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
        requireText(userId, "userId");
        Show show = getRequiredShow(showId);
        validateShowSeatList(showId, showSeatList);
        List<ReentrantLock> showSeatLocks = showSeatLockManager.acquireLocks(show, showSeatList);
        try {
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
        } finally {
            showSeatLockManager.releaseLocks(showSeatLocks);
        }
    }

    public Ticket pay(String ticketId, Payment payment) {
        requireText(ticketId, "ticketId");
        requireNotNull(payment, "payment");
        requirePositive(payment.getAmount(), "payment amount");
        validateSupportedPayment(payment);
        Ticket ticket = getRequiredTicket(ticketId);
        releaseExpiredHolds(ticket.getShowId());
        Show show = getRequiredShow(ticket.getShowId());
        List<ReentrantLock> showSeatLocks = showSeatLockManager.acquireLocks(show, ticket.getShowSeatList());
        try {
            ticket.validateCanConfirm();
            validateShowSeatsCanBeBooked(ticket);
            if (Double.compare(payment.getAmount(), ticket.getPrice()) != 0) {
                throw new RuntimeException("Payment amount does not match ticket price");
            }
            if (!paymentProcessor.process(payment)) {
                throw new RuntimeException("Payment failed for ticket: " + ticketId);
            }
            for (String showSeatId : ticket.getShowSeatList()) {
                ShowSeat showSeat = getRequiredShowSeat(showSeatId);
                showSeat.book();
            }
            ticket.confirm();

            return ticket;
        } finally {
            showSeatLockManager.releaseLocks(showSeatLocks);
        }
    }

    public Ticket getTicket(String ticketId) {
        return getRequiredTicket(ticketId);
    }

    // System methods

    private void releaseExpiredHolds(String showId) {
        LocalDateTime now = LocalDateTime.now();
        for (Ticket ticket : dataStore.getTicketList()) {
            if (ticket.getShowId().equals(showId) && ticket.isExpired(now)) {
                Show show = getRequiredShow(ticket.getShowId());
                List<ReentrantLock> showSeatLocks = showSeatLockManager.acquireLocks(show, ticket.getShowSeatList());
                try {
                    if (ticket.isExpired(LocalDateTime.now())) {
                        ticket.expire();
                        for (String showSeatId : ticket.getShowSeatList()) {
                            ShowSeat showSeat = getRequiredShowSeat(showSeatId);
                            if (showSeat.getSeatStatus() == SeatStatus.HELD) {
                                showSeat.releaseHold();
                            }
                        }
                    }
                } finally {
                    showSeatLockManager.releaseLocks(showSeatLocks);
                }
            }
        }
    }

    private void validateShowSeatsCanBeBooked(Ticket ticket) {
        for (String showSeatId : ticket.getShowSeatList()) {
            ShowSeat showSeat = getRequiredShowSeat(showSeatId);
            showSeat.validateCanBook();
        }
    }

    private void validateShowSeatsCanBeHeld(List<String> showSeatList) {
        for (String showSeatId : showSeatList) {
            ShowSeat showSeat = getRequiredShowSeat(showSeatId);
            showSeat.validateCanHold();
        }
    }

    private void holdSeats(List<String> showSeatList) {
        for (String showSeatId : showSeatList) {
            ShowSeat showSeat = getRequiredShowSeat(showSeatId);
            showSeat.hold();
        }
    }

    private void calculatePricesForAvailableShowSeats(Show show, List<ShowSeat> showSeatList) {
        for (ShowSeat showSeat : showSeatList) {
            List<ReentrantLock> showSeatLocks = showSeatLockManager.acquireLocks(show, List.of(showSeat.getShowSeatId()));
            try {
                if (showSeat.getSeatStatus() == SeatStatus.AVAILABLE) {
                    showSeat.updatePrice(calculateShowSeatPrice(show, showSeat));
                }
            } finally {
                showSeatLockManager.releaseLocks(showSeatLocks);
            }
        }
    }

    // Admin add methods

    public void addCity(String cityId, String name) {
        requireText(cityId, "cityId");
        requireText(name, "name");
        synchronized (catalogLock) {
            if (dataStore.containsCity(cityId)) {
                throw new RuntimeException("City already exists: " + cityId);
            }
            City city = new City(cityId, name);
            dataStore.putCity(city.getCityId(), city);
        }
    }

    public void addMovie(String movieId, String title) {
        requireText(movieId, "movieId");
        requireText(title, "title");
        synchronized (catalogLock) {
            if (dataStore.containsMovie(movieId)) {
                throw new RuntimeException("Movie already exists: " + movieId);
            }
            Movie movie = new Movie(movieId, title);
            dataStore.putMovie(movie.getMovieId(), movie);
        }
    }

    public void addTheater(String cityId, String theaterId, String name) {
        requireText(cityId, "cityId");
        requireText(theaterId, "theaterId");
        requireText(name, "name");
        City city = getRequiredCity(cityId);
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
        requireText(theaterId, "theaterId");
        requireText(screenId, "screenId");
        requireText(name, "name");
        Theater theater = getRequiredTheater(theaterId);
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
        requireText(screenId, "screenId");
        requireText(seatId, "seatId");
        requireNotNull(seatType, "seatType");
        Screen screen = getRequiredScreen(screenId);
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
        requireText(showId, "showId");
        requireText(movieId, "movieId");
        requireText(screenId, "screenId");
        requireNotNull(startTime, "startTime");
        requirePositive(basePrice, "basePrice");
        getRequiredMovie(movieId);
        Screen screen = getRequiredScreen(screenId);
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
            Show show = getRequiredShow(showId);
            Movie movie = getRequiredMovie(show.getMovieId());
            if (movie.getTitle().equalsIgnoreCase(movieTitle)) {
                result.add(show);
            }
        }
    }

    private boolean isShowSeatForShow(String showId, String showSeatId) {
        return showSeatId.startsWith(showId + "-");
    }

    private int calculateShowSeatPrice(Show show, ShowSeat showSeat) {
        Seat seat = getRequiredSeat(showSeat.getSeatId());
        return priceCalculator.calculateShowSeatPrice(showSeat.getBasePrice(), seat.getSeatType(), show.getStartTime());
    }

    private void validateShowSeatList(String showId, List<String> showSeatList) {
        if (showSeatList == null || showSeatList.isEmpty()) {
            throw new IllegalArgumentException("showSeatList is required");
        }
        Set<String> selectedShowSeatIds = new HashSet<>();
        for (String showSeatId : showSeatList) {
            requireText(showSeatId, "showSeatId");
            if (!selectedShowSeatIds.add(showSeatId)) {
                throw new IllegalArgumentException("Duplicate show seat selected: " + showSeatId);
            }
        }
        for (String showSeatId : showSeatList) {
            ShowSeat showSeat = getRequiredShowSeat(showSeatId);
            if (!isShowSeatForShow(showId, showSeat.getShowSeatId())) {
                throw new IllegalArgumentException("Show seat does not belong to show: " + showSeatId);
            }
        }
    }

    private void validateSupportedPayment(Payment payment) {
        if (!(payment instanceof CreditCardPayment) && !(payment instanceof UPIPayment)) {
            throw new IllegalArgumentException("Unsupported payment type");
        }
    }

    private void requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
    }

    private void requireNotNull(Object value, String fieldName) {
        if (value == null) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
    }

    private void requirePositive(int value, String fieldName) {
        if (value <= 0) {
            throw new IllegalArgumentException(fieldName + " must be positive");
        }
    }

    private void requirePositive(double value, String fieldName) {
        if (value <= 0) {
            throw new IllegalArgumentException(fieldName + " must be positive");
        }
    }

    private City getRequiredCity(String cityId) {
        requireText(cityId, "cityId");
        City city = dataStore.getCity(cityId);
        if (city == null) {
            throw new NoSuchElementException("City not found: " + cityId);
        }
        return city;
    }

    private Movie getRequiredMovie(String movieId) {
        requireText(movieId, "movieId");
        Movie movie = dataStore.getMovie(movieId);
        if (movie == null) {
            throw new NoSuchElementException("Movie not found: " + movieId);
        }
        return movie;
    }

    private Theater getRequiredTheater(String theaterId) {
        requireText(theaterId, "theaterId");
        Theater theater = dataStore.getTheater(theaterId);
        if (theater == null) {
            throw new NoSuchElementException("Theater not found: " + theaterId);
        }
        return theater;
    }

    private Screen getRequiredScreen(String screenId) {
        requireText(screenId, "screenId");
        Screen screen = dataStore.getScreen(screenId);
        if (screen == null) {
            throw new NoSuchElementException("Screen not found: " + screenId);
        }
        return screen;
    }

    private Show getRequiredShow(String showId) {
        requireText(showId, "showId");
        Show show = dataStore.getShow(showId);
        if (show == null) {
            throw new NoSuchElementException("Show not found: " + showId);
        }
        return show;
    }

    private Seat getRequiredSeat(String seatId) {
        requireText(seatId, "seatId");
        Seat seat = dataStore.getSeat(seatId);
        if (seat == null) {
            throw new NoSuchElementException("Seat not found: " + seatId);
        }
        return seat;
    }

    private ShowSeat getRequiredShowSeat(String showSeatId) {
        requireText(showSeatId, "showSeatId");
        ShowSeat showSeat = dataStore.getShowSeat(showSeatId);
        if (showSeat == null) {
            throw new NoSuchElementException("Show seat not found: " + showSeatId);
        }
        return showSeat;
    }

    private Ticket getRequiredTicket(String ticketId) {
        requireText(ticketId, "ticketId");
        Ticket ticket = dataStore.getTicket(ticketId);
        if (ticket == null) {
            throw new NoSuchElementException("Ticket not found: " + ticketId);
        }
        return ticket;
    }

}

