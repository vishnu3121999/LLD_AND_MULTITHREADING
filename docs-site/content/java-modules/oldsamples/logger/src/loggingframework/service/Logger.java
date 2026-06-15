package loggingframework.service;

import loggingframework.appender.ConsoleAppender;
import loggingframework.appender.FileAppender;
import loggingframework.formatter.JsonFormatter;
import loggingframework.formatter.TextFormatter;
import loggingframework.handler.DebugHandler;
import loggingframework.handler.ErrorHandler;
import loggingframework.handler.InfoHandler;
import loggingframework.handler.LogHandler;
import loggingframework.handler.WarnHandler;
import loggingframework.model.LogEvent;
import loggingframework.model.LogLevel;

import java.util.List;

public class Logger {
    private static volatile Logger instance;

    private final String name;
    private final LogLevel minimumLevel;
    private final LogHandler rootHandler;

    private Logger(String name, LogLevel minimumLevel, LogHandler rootHandler) {
        this.name = name;
        this.minimumLevel = minimumLevel;
        this.rootHandler = rootHandler;
    }

    public static Logger getInstance(LogHandler rootHandler) {
        if (instance == null) {
            synchronized (Logger.class) {
                if (instance == null) {
                    instance = new Logger("InterviewLogger", LogLevel.DEBUG, rootHandler);
                }
            }
        }
        return instance;
    }

    public void debug(String message) {
        log(LogLevel.DEBUG, message);
    }

    public void info(String message) {
        log(LogLevel.INFO, message);
    }

    public void warn(String message) {
        log(LogLevel.WARN, message);
    }

    public void error(String message) {
        log(LogLevel.ERROR, message);
    }

    public void log(LogLevel level, String message) {
        if (level.getSeverity() < minimumLevel.getSeverity()) {
            return;
        }
        rootHandler.handle(new LogEvent(level, name, message));
    }

}
