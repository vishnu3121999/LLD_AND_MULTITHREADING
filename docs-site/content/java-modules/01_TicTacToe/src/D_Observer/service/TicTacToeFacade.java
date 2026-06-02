package D_Observer.service;

import D_Observer.command.CommandInvoker;
import D_Observer.command.MoveCommand;
import D_Observer.datastore.IDatastore;
import D_Observer.model.Move;
import D_Observer.model.Player;
import D_Observer.model.enums.GameState;
import D_Observer.model.game.TicTacToeGame;
import D_Observer.observer.GameObserver;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class TicTacToeFacade {
    private final IDatastore datastore;
    private final List<GameObserver> observers;

    public void startGame() {
        TicTacToeGame game = datastore.getGame();
        String event;
        game.start();
        event = "Game started";
        notifyObservers(event, game);
    }

    public boolean makeMove(Player player, int row, int col) {
        TicTacToeGame game = datastore.getGame();
        CommandInvoker invoker = datastore.getCommandInvoker();
        Move move = new Move(row, col, player.getSymbol());
        String event = null;
        boolean success = invoker.execute(new MoveCommand(game, move));
        if (success) {
            event = buildMoveEvent(game, move);
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
        boolean success = invoker.undoLast();
        if (success) {
            event = "Move undone";
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
