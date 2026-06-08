package A_basic.datastore;

        import A_basic.model.LogApplication;
import A_basic.model.Appender;
import A_basic.model.LogEntry;

        public interface DataStore {

            LogApplication getLogApplication(String key);

            void putLogApplication(String key, LogApplication value);

            boolean containsLogApplication(String key);

            LogApplication removeLogApplication(String key);
            Appender getAppender(String key);

            void putAppender(String key, Appender value);

            boolean containsAppender(String key);

            Appender removeAppender(String key);
            LogEntry getLogEntry(String key);

            void putLogEntry(String key, LogEntry value);

            boolean containsLogEntry(String key);

            LogEntry removeLogEntry(String key);
        }
