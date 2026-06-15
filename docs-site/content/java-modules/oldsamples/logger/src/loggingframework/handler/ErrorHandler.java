package loggingframework.handler;

import loggingframework.appender.Appender;
import loggingframework.model.LogLevel;

import java.util.List;

public class ErrorHandler extends LogHandler {
    public ErrorHandler(List<Appender> appenders) {
        super(LogLevel.ERROR, appenders);
    }
}
