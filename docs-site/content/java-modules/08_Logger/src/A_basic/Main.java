package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.model.enums.AppenderType;
import A_basic.model.enums.LogLevel;
import A_basic.service.LoggerFacade;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Logger Basic Demo ===");
        DataStore dataStore = new InMemoryDataStore();
        LoggerFacade facade = new LoggerFacade(dataStore);
        String appId = id("app");
        String consoleAppenderId = id("appender");
        String fileAppenderId = id("appender");
        String infoLogId = id("log");
        String errorLogId = id("log");
        facade.addApplication(appId, "Order Service");
        facade.addAppender(appId, consoleAppenderId, AppenderType.CONSOLE, LogLevel.INFO);
        facade.addAppender(appId, fileAppenderId, AppenderType.FILE, LogLevel.ERROR);
        facade.log(appId, infoLogId, LogLevel.INFO, "order created", 1000);
        facade.log(appId, errorLogId, LogLevel.ERROR, "payment failed", 1010);
        System.out.println(dataStore.getAppender(consoleAppenderId));
        System.out.println(dataStore.getAppender(fileAppenderId));
        System.out.println(dataStore.getLogEntry(errorLogId));
    }
    private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); }
}
