package K_persistence.datastore;

import K_persistence.memento.GameCaretaker;
import K_persistence.service.ChessGame;

public interface IDatastore {
    void saveGame(String gameId, ChessGame game);
    ChessGame getGame(String gameId);
    void saveGameCaretaker(String gameId, GameCaretaker gameCaretaker);
    GameCaretaker getGameCaretaker(String gameId);
}





