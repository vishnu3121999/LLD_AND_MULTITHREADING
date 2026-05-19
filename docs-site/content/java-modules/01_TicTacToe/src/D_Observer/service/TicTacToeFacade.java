package D_Observer.service;

import D_Observer.command.CommandInvoker;
import D_Observer.command.MoveCommand;
import D_Observer.datastore.IDatastore;
import D_Observer.model.Move;
import D_Observer.model.Player;
import D_Observer.model.game.TicTacToeGame;
import D_Observer.observer.GameObserver;

public class TicTacToeFacade {
    private final IDatastore datastore;

    public void startGame() {
        TicTacToeGame game = datastore.getGame();
        game.start();
    }

    public boolean makeMove(Player player, int row, int col) {
        TicTacToeGame game = datastore.getGame();
        CommandInvoker invoker = datastore.getCommandInvoker();
        Move move = new Move(row, col, player.getSymbol());
        return invoker.execute(new MoveCommand(game, move));
    }

    public boolean undoLastMove() {
        CommandInvoker invoker = datastore.getCommandInvoker();
        return invoker.undoLast();
    }

    public void addObserver(GameObserver observer) {
        TicTacToeGame game = datastore.getGame();
        game.addObserver(observer);
    }

    public void removeObserver(GameObserver observer) {
        TicTacToeGame game = datastore.getGame();
        game.removeObserver(observer);
    }

    public TicTacToeFacade(IDatastore datastore) {
        this.datastore = datastore;
    }
}

