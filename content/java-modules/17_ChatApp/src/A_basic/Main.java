package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.model.Message;
import A_basic.model.enums.ChatType;
import A_basic.service.ChatAppFacade;

import java.util.List;
import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Chat App Basic Demo ===");
        DataStore dataStore = new InMemoryDataStore();
        ChatAppFacade facade = new ChatAppFacade(dataStore);
        String userA = id("user"); String userB = id("user"); String chatId = id("chat");
        facade.addUser(userA, "Asha"); facade.addUser(userB, "Bala");
        facade.createChat(chatId, ChatType.DIRECT, List.of(userA, userB));
        facade.sendMessage(chatId, id("message"), userA, "Hello", 1000);
        facade.sendMessage(chatId, id("message"), userB, "Hi", 1001);
        for (Message message : facade.viewMessages(chatId)) System.out.println(message);
    }
    private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); }
}
