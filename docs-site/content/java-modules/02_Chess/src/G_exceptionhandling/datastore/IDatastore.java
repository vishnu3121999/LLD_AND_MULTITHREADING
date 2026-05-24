package G_exceptionhandling.datastore;

import G_exceptionhandling.service.ChessGame;

public interface IDatastore {
    void saveGame(String gameId, ChessGame game);
    ChessGame getGame(String gameId);
}



