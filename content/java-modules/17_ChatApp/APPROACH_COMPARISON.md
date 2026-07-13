# Approach Comparison

## Existing Packages

`A_basic` demonstrates users, direct/group chats, messages, sending messages, and viewing chat history.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- A chat app has users, chats, and messages.
- A chat stores participant IDs and message IDs.
- A message stores sender, content, and timestamp.

Action based points:
- Admin adds users.
- User creates a chat, sends messages, and views messages.
- System attaches messages to the chat.

Misc:
- A_basic assumes valid participants.
- Read receipts, delivery status, media, search, and notifications are deferred.

#### Common Misc

Offline or online:
- Treat as online because users, chats, and messages are stored independently.

Extensibility:
- Message types, group admin permissions, and delivery notifications are future extensions.

History and undo:
- Message history exists; edit/delete undo is deferred.

Notifications:
- Push notifications are future Observer/Notification concerns.

Exception handling:
- Invalid sender/chat and permissions are later validations.

Concurrency:
- Concurrent sends to same chat are deferred.

### UseCase Diagram

Actors:
- User
- Admin
- System

UseCases:
- addUser(Admin) -> create User(System)
- createChat(User) -> create Chat(System)
- sendMessage(User) -> create Message(System) -> add message id to Chat(System)
- viewMessages(User) -> load Messages(System)

### Class Diagram

Core entities:
- `User(userId, name)` stores user data.
- `Chat(chatId, chatType, participantList, messageList)` stores chat membership and message IDs.
- `Message(messageId, senderId, content, sentAt)` stores message data.

Method placement:
- Chat creation, sending, and message loading belong in the facade.
- `addMessage` belongs in `Chat` because it only mutates chat message list.
