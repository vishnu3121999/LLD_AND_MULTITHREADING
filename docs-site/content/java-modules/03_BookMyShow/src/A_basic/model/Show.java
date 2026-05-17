package A_basic.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Collections;

public class Show {
    private final String showId;
    private final Movie movie;
    private final Theatre theatre;
    private final Screen screen;
    private final LocalDateTime startTime;
    private final Map<String, ShowSeat> showSeatsById;

    public Show(
            String showId,
            Movie movie,
            Theatre theatre,
            Screen screen,
            LocalDateTime startTime,
            Map<A_basic.model.enums.SeatType, Double> seatPricing
    ) {
        this.showId = showId;
        this.movie = movie;
        this.theatre = theatre;
        this.screen = screen;
        this.startTime = startTime;
        this.showSeatsById = new LinkedHashMap<>();

        for (Seat seat : screen.getSeats()) {
            double price = seatPricing.get(seat.getSeatType());
            showSeatsById.put(seat.getSeatId(), new ShowSeat(seat, price));
        }
    }

    public ShowSeat getShowSeat(String seatId) {
        return showSeatsById.get(seatId);
    }

    public List<ShowSeat> getShowSeats(List<String> seatIds) {
        List<ShowSeat> seats = new ArrayList<>();
        for (String seatId : seatIds) {
            ShowSeat showSeat = showSeatsById.get(seatId);
            if (showSeat != null) {
                seats.add(showSeat);
            }
        }
        return seats;
    }

    public List<ShowSeat> getAvailableShowSeats() {
        List<ShowSeat> availableSeats = new ArrayList<>();
        for (ShowSeat showSeat : showSeatsById.values()) {
            if (showSeat.isAvailable()) {
                availableSeats.add(showSeat);
            }
        }
        return availableSeats;
    }

    public String getShowId() {
        return showId;
    }

    public Movie getMovie() {
        return movie;
    }

    public Theatre getTheatre() {
        return theatre;
    }

    public Screen getScreen() {
        return screen;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public Map<String, ShowSeat> getShowSeatsById() {
        return Collections.unmodifiableMap(showSeatsById);
    }
}
