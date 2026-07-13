package A_basic.datastore;

        import A_basic.model.User;
import A_basic.model.Chat;
import A_basic.model.Message;

        public interface DataStore {

            User getUser(String key);

            void putUser(String key, User value);

            boolean containsUser(String key);

            User removeUser(String key);
            Chat getChat(String key);

            void putChat(String key, Chat value);

            boolean containsChat(String key);

            Chat removeChat(String key);
            Message getMessage(String key);

            void putMessage(String key, Message value);

            boolean containsMessage(String key);

            Message removeMessage(String key);
        }
