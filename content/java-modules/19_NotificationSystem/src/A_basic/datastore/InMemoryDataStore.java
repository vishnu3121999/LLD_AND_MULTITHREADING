package A_basic.datastore;

        import A_basic.model.Recipient;
import A_basic.model.Notification;
import A_basic.model.NotificationTemplate;

        import java.util.HashMap;
        import java.util.Map;

        public class InMemoryDataStore implements DataStore {
            private final Map<String, Recipient> recipientMap;
    private final Map<String, Notification> notificationMap;
    private final Map<String, NotificationTemplate> notificationTemplateMap;

            public InMemoryDataStore() {
                this.recipientMap = new HashMap<>();
        this.notificationMap = new HashMap<>();
        this.notificationTemplateMap = new HashMap<>();
            }


            @Override
            public Recipient getRecipient(String key) {
                return recipientMap.get(key);
            }

            @Override
            public void putRecipient(String key, Recipient value) {
                recipientMap.put(key, value);
            }

            @Override
            public boolean containsRecipient(String key) {
                return recipientMap.containsKey(key);
            }

            @Override
            public Recipient removeRecipient(String key) {
                return recipientMap.remove(key);
            }
            @Override
            public Notification getNotification(String key) {
                return notificationMap.get(key);
            }

            @Override
            public void putNotification(String key, Notification value) {
                notificationMap.put(key, value);
            }

            @Override
            public boolean containsNotification(String key) {
                return notificationMap.containsKey(key);
            }

            @Override
            public Notification removeNotification(String key) {
                return notificationMap.remove(key);
            }
            @Override
            public NotificationTemplate getNotificationTemplate(String key) {
                return notificationTemplateMap.get(key);
            }

            @Override
            public void putNotificationTemplate(String key, NotificationTemplate value) {
                notificationTemplateMap.put(key, value);
            }

            @Override
            public boolean containsNotificationTemplate(String key) {
                return notificationTemplateMap.containsKey(key);
            }

            @Override
            public NotificationTemplate removeNotificationTemplate(String key) {
                return notificationTemplateMap.remove(key);
            }
        }
