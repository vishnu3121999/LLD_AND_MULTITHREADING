package C_Factory.datastore;

import C_Factory.service.ChessGame;

public interface IDatastore {
    void saveGame(String gameId, ChessGame game);
    ChessGame getGame(String gameId);
}
