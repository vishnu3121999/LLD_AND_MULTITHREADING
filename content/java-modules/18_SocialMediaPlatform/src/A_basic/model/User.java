package A_basic.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class User { private final String userId; private final String name; private final List<String> followingList; private final List<String> postList; public User(String userId, String name) { this.userId = userId; this.name = name; this.followingList = new ArrayList<>(); this.postList = new ArrayList<>(); } public void follow(String otherUserId) { followingList.add(otherUserId); } public void addPost(String postId) { postList.add(postId); } @Override public String toString() { return "User{" + "userId='" + userId + "'" + ", name='" + name + "'" + ", followingList=" + followingList + ", postList=" + postList + '}'; } public String getUserId() { return userId; } public String getName() { return name; } public List<String> getFollowingList() { return Collections.unmodifiableList(followingList); } public List<String> getPostList() { return Collections.unmodifiableList(postList); } }
