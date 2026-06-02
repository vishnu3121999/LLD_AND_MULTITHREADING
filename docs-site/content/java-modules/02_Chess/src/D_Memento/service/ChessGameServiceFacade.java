package D_Memento.service;

import D_Memento.datastore.IDatastore;
import D_Memento.memento.GameCaretaker;
import D_Memento.memento.GameMemento;
import D_Memento.model.Move;
import D_Memento.model.Player;
import D_Memento.model.Position;

public class ChessGameServiceFacade {
    private final IDatastore datastore;

    public ChessGameServiceFacade(IDatastore datastore) {
        this.datastore = datastore;
    }

    public void createGame(String gameId, Player whitePlayer, Player blackPlayer) {
        datastore.saveGame(gameId, new ClassicGame(gameId, whitePlayer, blackPlayer));
        datastore.saveGameCaretaker(gameId, new GameCaretaker(gameId));
    }

    public void startGame(String gameId) {
        ChessGame game = datastore.getGame(gameId);
        game.start();
        game.getBoard().print();
    }

    public boolean move(String gameId, Player player, Position from, Position to) {
        ChessGame game = datastore.getGame(gameId);
        GameCaretaker gameCaretaker = datastore.getGameCaretaker(gameId);
        GameMemento beforeMove = game.createMemento();
        boolean success = game.move(new Move(player, from, to));
        if (success) {
            gameCaretaker.save(beforeMove);
            game.getBoard().print();
        }
        return success;
    }

    public boolean undoLastMove(String gameId) {
        ChessGame game = datastore.getGame(gameId);
        GameCaretaker gameCaretaker = datastore.getGameCaretaker(gameId);
        GameMemento memento = gameCaretaker.undo();
        if (memento == null) {
            return false;
        }
        game.restore(memento);
        game.getBoard().print();
        return true;
    }
}

