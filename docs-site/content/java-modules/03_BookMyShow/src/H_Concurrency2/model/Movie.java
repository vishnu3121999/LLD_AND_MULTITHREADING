package H_Concurrency2.model;

public class Movie {
    private final String movieId;
    private final String title;

    public Movie(String movieId, String title) {
        this.movieId = movieId;
        this.title = title;
    }

    @Override
    public String toString() {
        return "Movie{" +
                "movieId='" + movieId + '\'' +
                ", title='" + title + '\'' +
                '}';
    }

    public String getMovieId() {
        return movieId;
    }

    public String getTitle() {
        return title;
    }
}

