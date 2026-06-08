# Approach Comparison

## Existing Packages

`A_basic` demonstrates users, follows, posts, comments, likes, and a simple feed from followed users.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- Users can follow other users.
- Users create posts.
- Posts have comments and likes.

Action based points:
- Admin adds users.
- User follows another user, creates post, comments, likes, and views feed.
- System builds feed from followed users' posts.

Misc:
- A_basic has no ranking, privacy, media, or pagination.

#### Common Misc

Offline or online:
- Treat as online because users, posts, comments, and likes are stored independently.

Extensibility:
- Feed ranking, privacy, media handling, and notifications are future features.

History and undo:
- Posts/comments provide history; edit/delete are deferred.

Notifications:
- Like/comment/follow notifications are deferred.

Exception handling:
- Missing users/posts and permissions are later validations.

Concurrency:
- Concurrent likes/comments are later concerns.

### UseCase Diagram

Actors:
- User
- Admin
- System

UseCases:
- addUser(Admin)
- followUser(User) -> add followed user id(System)
- createPost(User) -> create Post(System) -> add post id to User(System)
- addComment(User) -> create Comment(System) -> add comment id to Post(System)
- likePost(User) -> create Like(System) -> add like id to Post(System)
- getFeed(User) -> collect followed users' posts(System)

### Class Diagram

Core entities:
- `User(userId, name, followingList, postList)` stores social graph and own posts.
- `Post(postId, authorId, content, commentList, likeList)` stores content and engagement IDs.
- `Comment(commentId, userId, text)` stores comment data.
- `Like(likeId, userId)` stores a like mapping.

Method placement:
- Feed and engagement workflows belong in the facade.
- Relationship list mutations belong in owning entities.
