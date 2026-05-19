package G_Composite.service;

import G_Composite.command.CommandInvoker;
import G_Composite.command.MoveCommand;
import G_Composite.datastore.IDatastore;
import G_Composite.model.Move;
import G_Composite.model.Player;
import G_Composite.model.game.TicTacToeGame;
import G_Composite.observer.GameObserver;

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


