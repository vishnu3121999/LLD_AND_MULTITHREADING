package I_AdditionalFeatures.datastore;

import I_AdditionalFeatures.memento.GameCaretaker;
import I_AdditionalFeatures.service.ChessGame;

public interface IDatastore {
    void saveGame(String gameId, ChessGame game);
    ChessGame getGame(String gameId);
    void saveGameCaretaker(String gameId, GameCaretaker gameCaretaker);
    GameCaretaker getGameCaretaker(String gameId);
}





