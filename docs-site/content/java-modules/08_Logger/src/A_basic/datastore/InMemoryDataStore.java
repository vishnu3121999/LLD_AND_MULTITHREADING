package A_basic.datastore;

        import A_basic.model.LogApplication;
import A_basic.model.Appender;
import A_basic.model.LogEntry;

        import java.util.HashMap;
        import java.util.Map;

        public class InMemoryDataStore implements DataStore {
            private final Map<String, LogApplication> logApplicationMap;
    private final Map<String, Appender> appenderMap;
    private final Map<String, LogEntry> logEntryMap;

            public InMemoryDataStore() {
                this.logApplicationMap = new HashMap<>();
        this.appenderMap = new HashMap<>();
        this.logEntryMap = new HashMap<>();
            }


            @Override
            public LogApplication getLogApplication(String key) {
                return logApplicationMap.get(key);
            }

            @Override
            public void putLogApplication(String key, LogApplication value) {
                logApplicationMap.put(key, value);
            }

            @Override
            public boolean containsLogApplication(String key) {
                return logApplicationMap.containsKey(key);
            }

            @Override
            public LogApplication removeLogApplication(String key) {
                return logApplicationMap.remove(key);
            }
            @Override
            public Appender getAppender(String key) {
                return appenderMap.get(key);
            }

            @Override
            public void putAppender(String key, Appender value) {
                appenderMap.put(key, value);
            }

            @Override
            public boolean containsAppender(String key) {
                return appenderMap.containsKey(key);
            }

            @Override
            public Appender removeAppender(String key) {
                return appenderMap.remove(key);
            }
            @Override
            public LogEntry getLogEntry(String key) {
                return logEntryMap.get(key);
            }

            @Override
            public void putLogEntry(String key, LogEntry value) {
                logEntryMap.put(key, value);
            }

            @Override
            public boolean containsLogEntry(String key) {
                return logEntryMap.containsKey(key);
            }

            @Override
            public LogEntry removeLogEntry(String key) {
                return logEntryMap.remove(key);
            }
        }
