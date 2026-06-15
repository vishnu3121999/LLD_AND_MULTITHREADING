package loggingframework.handler;

import loggingframework.appender.Appender;
import loggingframework.model.LogLevel;

import java.util.List;

public class DebugHandler extends LogHandler {
    public DebugHandler(List<Appender> appenders) {
        super(LogLevel.DEBUG, appenders);
    }
}
