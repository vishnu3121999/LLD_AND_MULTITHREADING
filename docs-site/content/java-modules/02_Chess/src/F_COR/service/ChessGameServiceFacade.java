package F_COR.service;

import F_COR.datastore.IDatastore;
import F_COR.memento.GameCaretaker;
import F_COR.memento.GameMemento;
import F_COR.model.Move;
import F_COR.model.Player;
import F_COR.model.Position;
import F_COR.observer.GameObserver;

import java.util.ArrayList;
import java.util.List;

public class ChessGameServiceFacade {
    private final IDatastore datastore;
    private final GameCaretaker gameCaretaker;
    private final List<GameObserver> observers;

    public ChessGameServiceFacade(IDatastore datastore) {
        this.datastore = datastore;
        this.gameCaretaker = new GameCaretaker();
        this.observers = new ArrayList<>();
    }

    public void addObserver(GameObserver observer) {
        observers.add(observer);
    }

    public void removeObserver(GameObserver observer) {
        observers.remove(observer);
    }

    public void createGame(String gameId, Player whitePlayer, Player blackPlayer) {
        datastore.saveGame(gameId, new ClassicGame(gameId, whitePlayer, blackPlayer));
    }

    public void startGame(String gameId) {
        ChessGame game = datastore.getGame(gameId);
        game.start();
        notifyGameStarted(gameId, game);
    }

    public boolean move(String gameId, Player player, Position from, Position to) {
        ChessGame game = datastore.getGame(gameId);
        Move move = new Move(player, from, to);
        GameMemento beforeMove = game.createMemento();
        boolean success = game.move(move);
        if (success) {
            gameCaretaker.save(gameId, beforeMove);
            notifyMoveCompleted(gameId, move, game);
        }
        return success;
    }

    public boolean undoLastMove(String gameId) {
        ChessGame game = datastore.getGame(gameId);
        GameMemento memento = gameCaretaker.undo(gameId);
        if (memento == null) {
            return false;
        }
        game.restore(memento);
        notifyMoveUndone(gameId, game);
        return true;
    }

    private void notifyGameStarted(String gameId, ChessGame game) {
        for (GameObserver observer : observers) {
            observer.onGameStarted(gameId, game);
        }
    }

    private void notifyMoveCompleted(String gameId, Move move, ChessGame game) {
        for (GameObserver observer : observers) {
            observer.onMoveCompleted(gameId, move, game);
        }
    }

    private void notifyMoveUndone(String gameId, ChessGame game) {
        for (GameObserver observer : observers) {
            observer.onMoveUndone(gameId, game);
        }
    }
}


