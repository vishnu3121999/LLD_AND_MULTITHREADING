package G_Composite.service;

import G_Composite.command.CommandInvoker;
import G_Composite.command.MoveCommand;
import G_Composite.datastore.IDatastore;
import G_Composite.model.Move;
import G_Composite.model.Player;
import G_Composite.model.enums.GameState;
import G_Composite.model.game.TicTacToeGame;
import G_Composite.observer.GameObserver;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class TicTacToeFacade {
    private final IDatastore datastore;
    private final List<GameObserver> observers;

    public void startGame() {
        TicTacToeGame game = datastore.getGame();
        String event;
        synchronized (game) {
            game.start();
            event = "Game started";
        }
        notifyObservers(event, game);
    }

    public boolean makeMove(Player player, int row, int col) {
        TicTacToeGame game = datastore.getGame();
        CommandInvoker invoker = datastore.getCommandInvoker();
        Move move = new Move(row, col, player.getSymbol());
        String event = null;
        boolean success;
        synchronized (game) {
            success = invoker.execute(new MoveCommand(game, move));
            if (success) {
                event = buildMoveEvent(game, move);
            }
        }
        if (event != null) {
            notifyObservers(event, game);
        }
        return success;
    }

    public boolean undoLastMove() {
        TicTacToeGame game = datastore.getGame();
        CommandInvoker invoker = datastore.getCommandInvoker();
        String event = null;
        boolean success;
        synchronized (game) {
            success = invoker.undoLast();
            if (success) {
                event = "Move undone";
            }
        }
        if (event != null) {
            notifyObservers(event, game);
        }
        return success;
    }

    public void addObserver(GameObserver observer) {
        if (observer != null) {
            observers.add(observer);
        }
    }

    public void removeObserver(GameObserver observer) {
        observers.remove(observer);
    }

    public TicTacToeFacade(IDatastore datastore) {
        this.datastore = datastore;
        this.observers = new CopyOnWriteArrayList<>();
    }

    private String buildMoveEvent(TicTacToeGame game, Move move) {
        if (game.getGameState() == GameState.WON) {
            return game.getWinner().getName() + " won the game";
        }
        if (game.getGameState() == GameState.DRAW) {
            return "Game ended in a draw";
        }
        return "Move applied by " + move.getSymbol();
    }

    private void notifyObservers(String event, TicTacToeGame game) {
        for (GameObserver observer : observers) {
            observer.onGameUpdated(event, game);
        }
    }
}
