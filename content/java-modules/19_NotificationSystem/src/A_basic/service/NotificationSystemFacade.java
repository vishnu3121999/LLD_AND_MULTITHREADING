package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.Notification;
import A_basic.model.NotificationTemplate;
import A_basic.model.Recipient;
import A_basic.model.enums.ChannelType;

public class NotificationSystemFacade {
    private final DataStore dataStore;
    public NotificationSystemFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public String sendNotification(String notificationId, String recipientId, ChannelType channelType, String message) {
        Notification notification = new Notification(notificationId, recipientId, channelType, message);
        deliver(notification);
        dataStore.putNotification(notification.getNotificationId(), notification);
        return notificationId;
    }

    public String sendTemplatedNotification(String notificationId, String recipientId, ChannelType channelType, String templateId) {
        return sendNotification(notificationId, recipientId, channelType, dataStore.getNotificationTemplate(templateId).getBody());
    }

    // System methods

    public void deliver(Notification notification) { notification.markSent(); }

    // Admin methods

    public void addRecipient(String recipientId, String name, String contact) { Recipient recipient = new Recipient(recipientId, name, contact); dataStore.putRecipient(recipient.getRecipientId(), recipient); }
    public void addTemplate(String notificationTemplateId, String body) { NotificationTemplate template = new NotificationTemplate(notificationTemplateId, body); dataStore.putNotificationTemplate(template.getNotificationTemplateId(), template); }

    // Util/helper methods
}
