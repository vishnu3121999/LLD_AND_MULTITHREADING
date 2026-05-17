package src.database;

import model.Player;
import model.game.Game;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class Datastore {
    private Map<String, Player> playerMap;
    private Map<String, Game> gameMap;

    public Datastore() {
        playerMap = new ConcurrentHashMap<>();
        gameMap = new ConcurrentHashMap<>();
    }

    public Game getGame(String key) {
        return gameMap.get(key);
    }

    public void putGame(String key, Game value) {
        gameMap.put(key, value);
    }

    public boolean containsGame(String key) {
        return gameMap.containsKey(key);
    }

    public Game removeGame(String key) {
        return gameMap.remove(key);
    }

    public Player getPlayer(String key) {
        return playerMap.get(key);
    }

    public void putPlayer(String key, Player value) {
        playerMap.put(key, value);
    }

    public boolean containsPlayer(String key) {
        return playerMap.containsKey(key);
    }

    public Player removePlayer(String key) {
        return playerMap.remove(key);
    }

}
