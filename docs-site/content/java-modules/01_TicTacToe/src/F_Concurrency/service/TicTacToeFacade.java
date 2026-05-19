package F_Concurrency.service;

import F_Concurrency.command.CommandInvoker;
import F_Concurrency.command.MoveCommand;
import F_Concurrency.datastore.IDatastore;
import F_Concurrency.model.Move;
import F_Concurrency.model.Player;
import F_Concurrency.model.game.TicTacToeGame;
import F_Concurrency.observer.GameObserver;

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


