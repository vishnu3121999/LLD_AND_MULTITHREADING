package A_basic.datastore;

        import A_basic.model.User;
import A_basic.model.Chat;
import A_basic.model.Message;

        import java.util.HashMap;
        import java.util.Map;

        public class InMemoryDataStore implements DataStore {
            private final Map<String, User> userMap;
    private final Map<String, Chat> chatMap;
    private final Map<String, Message> messageMap;

            public InMemoryDataStore() {
                this.userMap = new HashMap<>();
        this.chatMap = new HashMap<>();
        this.messageMap = new HashMap<>();
            }


            @Override
            public User getUser(String key) {
                return userMap.get(key);
            }

            @Override
            public void putUser(String key, User value) {
                userMap.put(key, value);
            }

            @Override
            public boolean containsUser(String key) {
                return userMap.containsKey(key);
            }

            @Override
            public User removeUser(String key) {
                return userMap.remove(key);
            }
            @Override
            public Chat getChat(String key) {
                return chatMap.get(key);
            }

            @Override
            public void putChat(String key, Chat value) {
                chatMap.put(key, value);
            }

            @Override
            public boolean containsChat(String key) {
                return chatMap.containsKey(key);
            }

            @Override
            public Chat removeChat(String key) {
                return chatMap.remove(key);
            }
            @Override
            public Message getMessage(String key) {
                return messageMap.get(key);
            }

            @Override
            public void putMessage(String key, Message value) {
                messageMap.put(key, value);
            }

            @Override
            public boolean containsMessage(String key) {
                return messageMap.containsKey(key);
            }

            @Override
            public Message removeMessage(String key) {
                return messageMap.remove(key);
            }
        }
