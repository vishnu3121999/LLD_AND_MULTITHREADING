package A_basic.datastore;

        import A_basic.model.User;
import A_basic.model.Post;
import A_basic.model.Comment;
import A_basic.model.Like;

        public interface DataStore {

            User getUser(String key);

            void putUser(String key, User value);

            boolean containsUser(String key);

            User removeUser(String key);
            Post getPost(String key);

            void putPost(String key, Post value);

            boolean containsPost(String key);

            Post removePost(String key);
            Comment getComment(String key);

            void putComment(String key, Comment value);

            boolean containsComment(String key);

            Comment removeComment(String key);
            Like getLike(String key);

            void putLike(String key, Like value);

            boolean containsLike(String key);

            Like removeLike(String key);
        }
