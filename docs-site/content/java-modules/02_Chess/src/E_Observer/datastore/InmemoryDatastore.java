package E_Observer.datastore;

import E_Observer.memento.GameCaretaker;
import E_Observer.service.ChessGame;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class InmemoryDatastore implements IDatastore {
    private final Map<String, ChessGame> games;
    private final Map<String, GameCaretaker> gameCaretakers;

    public InmemoryDatastore() {
        this.games = new ConcurrentHashMap<>();
        this.gameCaretakers = new ConcurrentHashMap<>();
    }

    @Override
    public void saveGame(String gameId, ChessGame game) {
        games.put(gameId, game);
    }

    @Override
    public ChessGame getGame(String gameId) {
        return games.get(gameId);
    }

    @Override
    public void saveGameCaretaker(String gameId, GameCaretaker gameCaretaker) {
        gameCaretakers.put(gameId, gameCaretaker);
    }

    @Override
    public GameCaretaker getGameCaretaker(String gameId) {
        return gameCaretakers.get(gameId);
    }
}

