package H_concurrency.datastore;

import H_concurrency.service.ChessGame;

public interface IDatastore {
    void saveGame(String gameId, ChessGame game);
    ChessGame getGame(String gameId);
}




