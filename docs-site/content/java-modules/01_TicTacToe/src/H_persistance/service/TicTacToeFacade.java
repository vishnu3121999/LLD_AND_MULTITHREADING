package H_persistance.service;

import H_persistance.command.CommandInvoker;
import H_persistance.command.MoveCommand;
import H_persistance.datastore.IDatastore;
import H_persistance.model.Move;
import H_persistance.model.Player;
import H_persistance.model.game.TicTacToeGame;
import H_persistance.observer.GameObserver;

public class TicTacToeFacade {
    private final IDatastore datastore;

    public void startGame() {
        TicTacToeGame game = datastore.getGame();
        game.start();
        datastore.save();
    }

    public boolean makeMove(Player player, int row, int col) {
        TicTacToeGame game = datastore.getGame();
        CommandInvoker invoker = datastore.getCommandInvoker();
        Move move = new Move(row, col, player.getSymbol());
        boolean success = invoker.execute(new MoveCommand(game, move));
        if (success) {
            datastore.save();
        }
        return success;
    }

    public boolean undoLastMove() {
        CommandInvoker invoker = datastore.getCommandInvoker();
        boolean success = invoker.undoLast();
        if (success) {
            datastore.save();
        }
        return success;
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


