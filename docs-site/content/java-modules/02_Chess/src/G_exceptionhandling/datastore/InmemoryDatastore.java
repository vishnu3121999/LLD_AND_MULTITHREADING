package G_exceptionhandling.datastore;

import G_exceptionhandling.service.ChessGame;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class InmemoryDatastore implements IDatastore {
    private final Map<String, ChessGame> games;

    public InmemoryDatastore() {
        this.games = new ConcurrentHashMap<>();
    }

    @Override
    public void saveGame(String gameId, ChessGame game) {
        games.put(gameId, game);
    }

    @Override
    public ChessGame getGame(String gameId) {
        return games.get(gameId);
    }
}



