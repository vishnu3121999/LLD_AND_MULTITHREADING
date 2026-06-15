package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.model.enums.LogLevel;
import A_basic.model.enums.SinkType;
import A_basic.service.LoggerFacade;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Logger Basic Demo ===");

        DataStore dataStore = new InMemoryDataStore();
        LoggerFacade facade = new LoggerFacade(dataStore);

        String loggerId = id("logger");
        String consoleSinkId = id("sink");

        facade.addLogger(loggerId, "ApplicationLogger", LogLevel.DEBUG);
        facade.addLogSink(consoleSinkId, "Console Sink", SinkType.CONSOLE);
        facade.attachSinkToLogger(loggerId, consoleSinkId);

        facade.debug(loggerId, "Loading application configuration");
        facade.info(loggerId, "Application started");
        facade.warn(loggerId, "Cache is warming up");
        facade.error(loggerId, "Sample error log");

        System.out.println(dataStore.getLoggerConfig(loggerId));
        System.out.println(dataStore.getLogSink(consoleSinkId));
        System.out.println(facade.getLogs(loggerId));
    }

    private static String id(String prefix) {
        return prefix + "-" + UUID.randomUUID();
    }
}
