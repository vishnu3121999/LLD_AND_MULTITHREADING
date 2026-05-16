package D_Observer.service;

import D_Observer.command.CommandInvoker;
import D_Observer.command.MoveCommand;
import D_Observer.model.Move;
import D_Observer.model.Player;
import D_Observer.model.game.TicTacToeGame;
import D_Observer.observer.GameObserver;

public class TicTacToeFacade {
    private final TicTacToeGame game;
    private final CommandInvoker invoker;

    public void startGame() {
        game.start();
    }

    public boolean makeMove(Player player, int row, int col) {
        Move move = new Move(row, col, player.getSymbol());
        return invoker.execute(new MoveCommand(game, move));
    }

    public boolean undoLastMove() {
        return invoker.undoLast();
    }

    public void addObserver(GameObserver observer) {
        game.addObserver(observer);
    }

    public void removeObserver(GameObserver observer) {
        game.removeObserver(observer);
    }

    public TicTacToeFacade(TicTacToeGame game) {
        this.game = game;
        this.invoker = new CommandInvoker();
    }
}

