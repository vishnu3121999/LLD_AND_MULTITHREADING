package K_persistence.service;

import K_persistence.datastore.IDatastore;
import K_persistence.memento.GameCaretaker;
import K_persistence.memento.GameMemento;
import K_persistence.model.Move;
import K_persistence.model.Player;
import K_persistence.model.Position;
import K_persistence.observer.GameObserver;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

public class ChessGameServiceFacade {
    private final IDatastore datastore;
    private final List<GameObserver> observers;
    private final Map<String, Object> gameLocks;

    public ChessGameServiceFacade(IDatastore datastore) {
        this.datastore = datastore;
        this.observers = new CopyOnWriteArrayList<>();
        this.gameLocks = new ConcurrentHashMap<>();
    }

    public void addObserver(GameObserver observer) {
        observers.add(observer);
    }

    public void removeObserver(GameObserver observer) {
        observers.remove(observer);
    }

    public void createGame(String gameId, Player whitePlayer, Player blackPlayer) {
        synchronized (lockFor(gameId)) {
            if (datastore.getGame(gameId) != null) {
                throw new IllegalStateException("Game already exists: " + gameId);
            }
            datastore.saveGame(gameId, new ClassicGame(gameId, whitePlayer, blackPlayer));
            datastore.saveGameCaretaker(gameId, new GameCaretaker(gameId));
        }
    }

    public void startGame(String gameId) {
        ChessGame game;
        synchronized (lockFor(gameId)) {
            game = getRequiredGame(gameId);
            game.start();
            datastore.saveGame(gameId, game);
        }
        notifyGameStarted(gameId, game);
    }

    public boolean move(String gameId, Player player, Position from, Position to) {
        Move move = new Move(player, from, to);
        ChessGame game;
        boolean success;
        synchronized (lockFor(gameId)) {
            game = getRequiredGame(gameId);
            GameCaretaker gameCaretaker = getRequiredGameCaretaker(gameId);
            GameMemento beforeMove = game.createMemento();
            success = game.move(move);
            if (success) {
                gameCaretaker.save(beforeMove);
                datastore.saveGame(gameId, game);
                datastore.saveGameCaretaker(gameId, gameCaretaker);
            }
        }
        if (success) {
            notifyMoveCompleted(gameId, move, game);
        }
        return success;
    }

    public boolean undoLastMove(String gameId) {
        ChessGame game;
        synchronized (lockFor(gameId)) {
            game = getRequiredGame(gameId);
            GameCaretaker gameCaretaker = getRequiredGameCaretaker(gameId);
            GameMemento memento = gameCaretaker.undo();
            if (memento == null) {
                throw new NoSuchElementException("No move history exists for game: " + gameId);
            }
            game.restore(memento);
            datastore.saveGame(gameId, game);
            datastore.saveGameCaretaker(gameId, gameCaretaker);
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

    private Object lockFor(String gameId) {
        return gameLocks.computeIfAbsent(gameId, ignored -> new Object());
    }
}





