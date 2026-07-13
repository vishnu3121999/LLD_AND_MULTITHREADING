package A_basic.model;

import A_basic.model.enums.ChatType;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Chat {
    private final String chatId;
    private final ChatType chatType;
    private final List<String> participantList;
    private final List<String> messageList;
    public Chat(String chatId, ChatType chatType, List<String> participantList) { this.chatId = chatId; this.chatType = chatType; this.participantList = new ArrayList<>(participantList); this.messageList = new ArrayList<>(); }
    public void addMessage(String messageId) { messageList.add(messageId); }
    @Override public String toString() { return "Chat{" + "chatId='" + chatId + "'" + ", chatType=" + chatType + ", participantList=" + participantList + ", messageList=" + messageList + '}'; }
    public String getChatId() { return chatId; }
    public ChatType getChatType() { return chatType; }
    public List<String> getParticipantList() { return Collections.unmodifiableList(participantList); }
    public List<String> getMessageList() { return Collections.unmodifiableList(messageList); }
}
