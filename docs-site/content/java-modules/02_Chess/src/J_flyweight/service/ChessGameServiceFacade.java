package J_flyweight.service;

import J_flyweight.datastore.IDatastore;
import J_flyweight.memento.GameCaretaker;
import J_flyweight.memento.GameMemento;
import J_flyweight.model.Move;
import J_flyweight.model.Player;
import J_flyweight.model.Position;
import J_flyweight.observer.GameObserver;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.concurrent.CopyOnWriteArrayList;

public class ChessGameServiceFacade {
    private final IDatastore datastore;
    private final List<GameObserver> observers;

    public ChessGameServiceFacade(IDatastore datastore) {
        this.datastore = datastore;
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
            datastore.saveGameCaretaker(gameId, new GameCaretaker(gameId));
        }
    }

    public void startGame(String gameId) {
        ChessGame game = getRequiredGame(gameId);
        synchronized (game) {
            game.start();
        }
        notifyGameStarted(gameId, game);
    }

    public boolean move(String gameId, Player player, Position from, Position to) {
        ChessGame game = getRequiredGame(gameId);
        GameCaretaker gameCaretaker = getRequiredGameCaretaker(gameId);
        Move move = new Move(player, from, to);
        boolean success;
        synchronized (game) {
            GameMemento beforeMove = game.createMemento();
            success = game.move(move);
            if (success) {
                gameCaretaker.save(beforeMove);
            }
        }
        if (success) {
            notifyMoveCompleted(gameId, move, game);
        }
        return success;
    }

    public boolean undoLastMove(String gameId) {
        ChessGame game = getRequiredGame(gameId);
        GameCaretaker gameCaretaker = getRequiredGameCaretaker(gameId);
        synchronized (game) {
            GameMemento memento = gameCaretaker.undo();
            if (memento == null) {
                throw new NoSuchElementException("No move history exists for game: " + gameId);
            }
            game.restore(memento);
        }
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

    private GameCaretaker getRequiredGameCaretaker(String gameId) {
        GameCaretaker gameCaretaker = datastore.getGameCaretaker(gameId);
        if (gameCaretaker == null) {
            throw new NoSuchElementException("Move history not found for game: " + gameId);
        }
        return gameCaretaker;
    }
}





