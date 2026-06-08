package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.Comment;
import A_basic.model.Like;
import A_basic.model.Post;
import A_basic.model.User;

import java.util.ArrayList;
import java.util.List;

public class SocialMediaPlatformFacade {
    private final DataStore dataStore;
    public SocialMediaPlatformFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public void followUser(String userId, String followUserId) { dataStore.getUser(userId).follow(followUserId); }
    public void createPost(String postId, String authorId, String content) { Post post = new Post(postId, authorId, content); dataStore.putPost(post.getPostId(), post); dataStore.getUser(authorId).addPost(postId); }
    public void addComment(String postId, String commentId, String userId, String text) { Comment comment = new Comment(commentId, userId, text); dataStore.putComment(comment.getCommentId(), comment); dataStore.getPost(postId).addComment(commentId); }
    public void likePost(String postId, String likeId, String userId) { Like like = new Like(likeId, userId); dataStore.putLike(like.getLikeId(), like); dataStore.getPost(postId).addLike(likeId); }
    public List<Post> getFeed(String userId) { List<Post> feed = new ArrayList<>(); User user = dataStore.getUser(userId); for (String followedUserId : user.getFollowingList()) for (String postId : dataStore.getUser(followedUserId).getPostList()) feed.add(dataStore.getPost(postId)); return feed; }

    // System methods

    // Admin methods

    public void addUser(String userId, String name) { User user = new User(userId, name); dataStore.putUser(user.getUserId(), user); }

    // Util/helper methods
}
