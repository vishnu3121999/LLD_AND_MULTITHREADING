package loggingframework.formatter;

import loggingframework.model.LogEvent;

import java.time.format.DateTimeFormatter;

public class TextFormatter implements Formatter {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public String format(LogEvent event) {
        return String.format(
                "%s [%s] %s - %s",
                DATE_FORMATTER.format(event.getTimestamp()),
                event.getLevel(),
                event.getLoggerName(),
                event.getMessage()
        );
    }
}
