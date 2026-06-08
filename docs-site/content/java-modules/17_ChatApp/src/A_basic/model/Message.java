package A_basic.model;

public class Message {
    private final String messageId;
    private final String senderId;
    private final String content;
    private final long sentAt;
    public Message(String messageId, String senderId, String content, long sentAt) { this.messageId = messageId; this.senderId = senderId; this.content = content; this.sentAt = sentAt; }
    @Override public String toString() { return "Message{" + "messageId='" + messageId + "'" + ", senderId='" + senderId + "'" + ", content='" + content + "'" + ", sentAt=" + sentAt + '}'; }
    public String getMessageId() { return messageId; } public String getSenderId() { return senderId; } public String getContent() { return content; } public long getSentAt() { return sentAt; }
}
