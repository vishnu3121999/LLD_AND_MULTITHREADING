package A_basic.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Post { private final String postId; private final String authorId; private final String content; private final List<String> commentList; private final List<String> likeList; public Post(String postId, String authorId, String content) { this.postId = postId; this.authorId = authorId; this.content = content; this.commentList = new ArrayList<>(); this.likeList = new ArrayList<>(); } public void addComment(String commentId) { commentList.add(commentId); } public void addLike(String likeId) { likeList.add(likeId); } @Override public String toString() { return "Post{" + "postId='" + postId + "'" + ", authorId='" + authorId + "'" + ", content='" + content + "'" + ", commentList=" + commentList + ", likeList=" + likeList + '}'; } public String getPostId() { return postId; } public String getAuthorId() { return authorId; } public String getContent() { return content; } public List<String> getCommentList() { return Collections.unmodifiableList(commentList); } public List<String> getLikeList() { return Collections.unmodifiableList(likeList); } }
