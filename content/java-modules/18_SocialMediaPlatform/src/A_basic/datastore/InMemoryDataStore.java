package A_basic.datastore;

        import A_basic.model.User;
import A_basic.model.Post;
import A_basic.model.Comment;
import A_basic.model.Like;

        import java.util.HashMap;
        import java.util.Map;

        public class InMemoryDataStore implements DataStore {
            private final Map<String, User> userMap;
    private final Map<String, Post> postMap;
    private final Map<String, Comment> commentMap;
    private final Map<String, Like> likeMap;

            public InMemoryDataStore() {
                this.userMap = new HashMap<>();
        this.postMap = new HashMap<>();
        this.commentMap = new HashMap<>();
        this.likeMap = new HashMap<>();
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
            public Post getPost(String key) {
                return postMap.get(key);
            }

            @Override
            public void putPost(String key, Post value) {
                postMap.put(key, value);
            }

            @Override
            public boolean containsPost(String key) {
                return postMap.containsKey(key);
            }

            @Override
            public Post removePost(String key) {
                return postMap.remove(key);
            }
            @Override
            public Comment getComment(String key) {
                return commentMap.get(key);
            }

            @Override
            public void putComment(String key, Comment value) {
                commentMap.put(key, value);
            }

            @Override
            public boolean containsComment(String key) {
                return commentMap.containsKey(key);
            }

            @Override
            public Comment removeComment(String key) {
                return commentMap.remove(key);
            }
            @Override
            public Like getLike(String key) {
                return likeMap.get(key);
            }

            @Override
            public void putLike(String key, Like value) {
                likeMap.put(key, value);
            }

            @Override
            public boolean containsLike(String key) {
                return likeMap.containsKey(key);
            }

            @Override
            public Like removeLike(String key) {
                return likeMap.remove(key);
            }
        }
