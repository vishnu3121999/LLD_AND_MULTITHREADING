package E_Observer.datastore;

import E_Observer.service.ChessGame;

public interface IDatastore {
    void saveGame(String gameId, ChessGame game);
    ChessGame getGame(String gameId);
}

