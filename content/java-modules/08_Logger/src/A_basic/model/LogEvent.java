package A_basic.model;

import A_basic.model.enums.LogLevel;

import java.time.LocalDateTime;

public class LogEvent {
    private final String logEventId;
    private final LogLevel logLevel;
    private final String loggerName;
    private final String message;
    private final LocalDateTime createdAt;

    public LogEvent(String logEventId, LogLevel logLevel, String loggerName, String message) {
        this.logEventId = logEventId;
        this.logLevel = logLevel;
        this.loggerName = loggerName;
        this.message = message;
        this.createdAt = LocalDateTime.now();
    }

    public String getLogEventId() {
        return logEventId;
    }

    public LogLevel getLogLevel() {
        return logLevel;
    }

    public String getLoggerName() {
        return loggerName;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    @Override
    public String toString() {
        return "LogEvent{" +
                "logEventId='" + logEventId + '\'' +
                ", logLevel=" + logLevel +
                ", loggerName='" + loggerName + '\'' +
                ", message='" + message + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
