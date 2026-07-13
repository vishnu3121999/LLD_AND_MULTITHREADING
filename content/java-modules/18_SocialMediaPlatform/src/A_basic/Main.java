package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.model.Post;
import A_basic.service.SocialMediaPlatformFacade;

import java.util.UUID;

public class Main { public static void main(String[] args) { System.out.println("=== Social Media Basic Demo ==="); DataStore dataStore = new InMemoryDataStore(); SocialMediaPlatformFacade facade = new SocialMediaPlatformFacade(dataStore); String userA = id("user"); String userB = id("user"); String postId = id("post"); facade.addUser(userA, "Asha"); facade.addUser(userB, "Bala"); facade.followUser(userA, userB); facade.createPost(postId, userB, "First post"); facade.addComment(postId, id("comment"), userA, "Nice post"); facade.likePost(postId, id("like"), userA); for (Post post : facade.getFeed(userA)) System.out.println(post); } private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); } }
