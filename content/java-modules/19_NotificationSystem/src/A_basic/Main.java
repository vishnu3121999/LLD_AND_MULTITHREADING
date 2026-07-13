package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.model.enums.ChannelType;
import A_basic.service.NotificationSystemFacade;

import java.util.UUID;

public class Main { public static void main(String[] args) { System.out.println("=== Notification System Basic Demo ==="); DataStore dataStore = new InMemoryDataStore(); NotificationSystemFacade facade = new NotificationSystemFacade(dataStore); String recipientId = id("recipient"); String templateId = id("template"); String notificationId = id("notification"); facade.addRecipient(recipientId, "Asha", "asha@example.com"); facade.addTemplate(templateId, "Your order is confirmed"); facade.sendTemplatedNotification(notificationId, recipientId, ChannelType.EMAIL, templateId); System.out.println(dataStore.getRecipient(recipientId)); System.out.println(dataStore.getNotification(notificationId)); } private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); } }
