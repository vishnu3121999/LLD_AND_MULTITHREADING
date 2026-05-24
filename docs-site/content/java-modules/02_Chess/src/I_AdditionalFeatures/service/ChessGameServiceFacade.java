package I_AdditionalFeatures.service;

import I_AdditionalFeatures.datastore.IDatastore;
import I_AdditionalFeatures.memento.GameCaretaker;
import I_AdditionalFeatures.memento.GameMemento;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.model.Player;
import I_AdditionalFeatures.model.Position;
import I_AdditionalFeatures.observer.GameObserver;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.concurrent.CopyOnWriteArrayList;

public class ChessGameServiceFacade {
    private final IDatastore datastore;
    private final GameCaretaker gameCaretaker;
    private final List<GameObserver> observers;

    public ChessGameServiceFacade(IDatastore datastore) {
        this.datastore = datastore;
        this.gameCaretaker = new GameCaretaker();
        this.observers = new CopyOnWriteArrayList<>();
    }

    public void addObserver(GameObserver observer) {
        observers.add(observer);
    }

    public void removeObserver(GameObserver observer) {
        observers.remove(observer);
    }

    public void createGame(String gameId, Player whitePlayer, Player blackPlayer) {
        synchronized (datastore) {
            if (datastore.getGame(gameId) != null) {
                throw new IllegalStateException("Game already exists: " + gameId);
            }
            datastore.saveGame(gameId, new ClassicGame(gameId, whitePlayer, blackPlayer));
        }
    }

    public void startGame(String gameId) {
        ChessGame game = getRequiredGame(gameId);
        synchronized (game) {
            game.start();
            notifyGameStarted(gameId, game);
        }
    }

    public boolean move(String gameId, Player player, Position from, Position to) {
        ChessGame game = getRequiredGame(gameId);
        synchronized (game) {
            Move move = new Move(player, from, to);
            GameMemento beforeMove = game.createMemento();
            boolean success = game.move(move);
            if (success) {
                gameCaretaker.save(gameId, beforeMove);
                notifyMoveCompleted(gameId, move, game);
            }
            return success;
        }
    }

    public boolean undoLastMove(String gameId) {
        ChessGame game = getRequiredGame(gameId);
        synchronized (game) {
            GameMemento memento = gameCaretaker.undo(gameId);
            if (memento == null) {
                throw new NoSuchElementException("No move history exists for game: " + gameId);
            }
            game.restore(memento);
            notifyMoveUndone(gameId, game);
            return true;
        }
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

    private ChessGame getRequiredGame(String gameId) {
        ChessGame game = datastore.getGame(gameId);
        if (game == null) {
            throw new NoSuchElementException("Game not found: " + gameId);
        }
        return game;
    }
}





