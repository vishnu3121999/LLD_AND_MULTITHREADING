package A_basic.model;

public class Movie {
    private final String movieId;
    private final String title;
    private final String language;
    private final int durationInMinutes;

    public Movie(String movieId, String title, String language, int durationInMinutes) {
        this.movieId = movieId;
        this.title = title;
        this.language = language;
        this.durationInMinutes = durationInMinutes;
    }

    public String getMovieId() {
        return movieId;
    }

    public String getTitle() {
        return title;
    }

    public String getLanguage() {
        return language;
    }

    public int getDurationInMinutes() {
        return durationInMinutes;
    }
}
