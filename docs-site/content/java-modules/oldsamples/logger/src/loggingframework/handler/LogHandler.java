package loggingframework.handler;

import loggingframework.appender.Appender;
import loggingframework.model.LogEvent;
import loggingframework.model.LogLevel;

import java.util.List;

public abstract class LogHandler {
    private final LogLevel level;
    private final List<Appender> appenders;
    private LogHandler nextHandler;

    protected LogHandler(LogLevel level, List<Appender> appenders) {
        this.level = level;
        this.appenders = appenders;
    }

    public void setNext(LogHandler nextHandler) {
        this.nextHandler = nextHandler;
    }

    public void handle(LogEvent event) {
        if (event.getLevel() == level) {
            for (Appender appender : appenders) {
                appender.append(event);
            }
        }
        if (nextHandler != null) {
            nextHandler.handle(event);
        }
    }
}
