package I_AdditionalFeatures.datastore;

import I_AdditionalFeatures.service.ChessGame;

public interface IDatastore {
    void saveGame(String gameId, ChessGame game);
    ChessGame getGame(String gameId);
}





