package loggingframework.model;

import java.time.LocalDateTime;

public class LogEvent {
    private final LocalDateTime timestamp;
    private final LogLevel level;
    private final String loggerName;
    private final String message;

    public LogEvent(LogLevel level, String loggerName, String message) {
        this.timestamp = LocalDateTime.now();
        this.level = level;
        this.loggerName = loggerName;
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public LogLevel getLevel() {
        return level;
    }

    public String getLoggerName() {
        return loggerName;
    }

    public String getMessage() {
        return message;
    }
}
