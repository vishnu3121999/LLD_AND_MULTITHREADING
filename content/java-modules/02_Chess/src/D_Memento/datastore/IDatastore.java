package D_Memento.datastore;

import D_Memento.memento.GameCaretaker;
import D_Memento.service.ChessGame;

public interface IDatastore {
    void saveGame(String gameId, ChessGame game);
    ChessGame getGame(String gameId);
    void saveGameCaretaker(String gameId, GameCaretaker gameCaretaker);
    GameCaretaker getGameCaretaker(String gameId);
}

