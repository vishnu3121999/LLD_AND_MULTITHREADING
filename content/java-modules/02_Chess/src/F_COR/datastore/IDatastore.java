package F_COR.datastore;

import F_COR.memento.GameCaretaker;
import F_COR.service.ChessGame;

public interface IDatastore {
    void saveGame(String gameId, ChessGame game);
    ChessGame getGame(String gameId);
    void saveGameCaretaker(String gameId, GameCaretaker gameCaretaker);
    GameCaretaker getGameCaretaker(String gameId);
}


