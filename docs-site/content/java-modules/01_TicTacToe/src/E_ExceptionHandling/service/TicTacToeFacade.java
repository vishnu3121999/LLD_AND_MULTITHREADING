package E_ExceptionHandling.service;

import E_ExceptionHandling.command.CommandInvoker;
import E_ExceptionHandling.command.MoveCommand;
import E_ExceptionHandling.datastore.IDatastore;
import E_ExceptionHandling.model.Move;
import E_ExceptionHandling.model.Player;
import E_ExceptionHandling.model.game.TicTacToeGame;
import E_ExceptionHandling.observer.GameObserver;

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


