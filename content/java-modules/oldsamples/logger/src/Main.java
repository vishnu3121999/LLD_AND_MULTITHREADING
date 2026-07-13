import loggingframework.appender.ConsoleAppender;
import loggingframework.appender.FileAppender;
import loggingframework.formatter.JsonFormatter;
import loggingframework.formatter.TextFormatter;
import loggingframework.handler.DebugHandler;
import loggingframework.handler.ErrorHandler;
import loggingframework.handler.InfoHandler;
import loggingframework.handler.LogHandler;
import loggingframework.handler.WarnHandler;
import loggingframework.service.Logger;

import java.util.List;

public class Main {
    public static void main(String[] args) {

        // Building handler chain (In log4j, its built from config xml)
        LogHandler debugHandler = new DebugHandler(List.of(
                new ConsoleAppender(new TextFormatter())
        ));
        LogHandler infoHandler = new InfoHandler(List.of(
                new ConsoleAppender(new TextFormatter()),
                new FileAppender("07_LoggingFramework/logs/info.log", new TextFormatter())
        ));
        LogHandler warnHandler = new WarnHandler(List.of(
                new ConsoleAppender(new JsonFormatter())
        ));
        LogHandler errorHandler = new ErrorHandler(List.of(
                new ConsoleAppender(new JsonFormatter()),
                new FileAppender("07_LoggingFramework/logs/error.log", new JsonFormatter())
        ));

        debugHandler.setNext(infoHandler);
        infoHandler.setNext(warnHandler);
        warnHandler.setNext(errorHandler);

        Logger logger = Logger.getInstance(debugHandler);

        logger.debug("Debug log for troubleshooting");
        logger.info("Application started");
        logger.warn("Cache miss ratio increased");
        logger.error("Payment service is unavailable");
    }
}
