package H_Concurrency2.model;

import java.time.LocalDateTime;

public class Show {
    private final String showId;
    private final String movieId;
    private final LocalDateTime startTime;

    public Show(String showId, String movieId, LocalDateTime startTime) {
        this.showId = showId;
        this.movieId = movieId;
        this.startTime = startTime;
    }

    @Override
    public String toString() {
        return "Show{" +
                "showId='" + showId + '\'' +
                ", movieId='" + movieId + '\'' +
                ", startTime=" + startTime +
                '}';
    }

    public String getShowId() {
        return showId;
    }

    public String getMovieId() {
        return movieId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }
}

