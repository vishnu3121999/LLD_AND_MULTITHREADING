package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.Chat;
import A_basic.model.Message;
import A_basic.model.User;
import A_basic.model.enums.ChatType;

import java.util.ArrayList;
import java.util.List;

public class ChatAppFacade {
    private final DataStore dataStore;
    public ChatAppFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public void createChat(String chatId, ChatType chatType, List<String> participantList) { Chat chat = new Chat(chatId, chatType, participantList); dataStore.putChat(chat.getChatId(), chat); }
    public String sendMessage(String chatId, String messageId, String senderId, String content, long sentAt) { Message message = new Message(messageId, senderId, content, sentAt); dataStore.putMessage(message.getMessageId(), message); dataStore.getChat(chatId).addMessage(messageId); return messageId; }
    public List<Message> viewMessages(String chatId) { List<Message> messages = new ArrayList<>(); for (String messageId : dataStore.getChat(chatId).getMessageList()) messages.add(dataStore.getMessage(messageId)); return messages; }

    // System methods

    // Admin methods

    public void addUser(String userId, String name) { User user = new User(userId, name); dataStore.putUser(user.getUserId(), user); }

    // Util/helper methods
}
