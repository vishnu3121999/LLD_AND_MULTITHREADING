package A_basic.datastore;

        import A_basic.model.Recipient;
import A_basic.model.Notification;
import A_basic.model.NotificationTemplate;

        public interface DataStore {

            Recipient getRecipient(String key);

            void putRecipient(String key, Recipient value);

            boolean containsRecipient(String key);

            Recipient removeRecipient(String key);
            Notification getNotification(String key);

            void putNotification(String key, Notification value);

            boolean containsNotification(String key);

            Notification removeNotification(String key);
            NotificationTemplate getNotificationTemplate(String key);

            void putNotificationTemplate(String key, NotificationTemplate value);

            boolean containsNotificationTemplate(String key);

            NotificationTemplate removeNotificationTemplate(String key);
        }
