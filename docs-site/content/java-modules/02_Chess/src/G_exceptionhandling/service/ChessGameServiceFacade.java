package G_exceptionhandling.service;

import G_exceptionhandling.datastore.IDatastore;
import G_exceptionhandling.memento.GameCaretaker;
import G_exceptionhandling.memento.GameMemento;
import G_exceptionhandling.model.Move;
import G_exceptionhandling.model.Player;
import G_exceptionhandling.model.Position;
import G_exceptionhandling.observer.GameObserver;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

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
        if (datastore.getGame(gameId) != null) {
            throw new IllegalStateException("Game already exists: " + gameId);
        }
        datastore.saveGame(gameId, new ClassicGame(gameId, whitePlayer, blackPlayer));
    }

    public void startGame(String gameId) {
        ChessGame game = getRequiredGame(gameId);
        game.start();
        notifyGameStarted(gameId, game);
    }

    public boolean move(String gameId, Player player, Position from, Position to) {
        ChessGame game = getRequiredGame(gameId);
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
        ChessGame game = getRequiredGame(gameId);
        GameMemento memento = gameCaretaker.undo(gameId);
        if (memento == null) {
            throw new NoSuchElementException("No move history exists for game: " + gameId);
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

    private ChessGame getRequiredGame(String gameId) {
        ChessGame game = datastore.getGame(gameId);
        if (game == null) {
            throw new NoSuchElementException("Game not found: " + gameId);
        }
        return game;
    }
}



