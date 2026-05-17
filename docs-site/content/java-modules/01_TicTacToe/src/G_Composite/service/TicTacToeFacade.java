package G_Composite.service;

import G_Composite.command.CommandInvoker;
import G_Composite.command.MoveCommand;
import G_Composite.model.Move;
import G_Composite.model.Player;
import G_Composite.model.game.TicTacToeGame;
import G_Composite.observer.GameObserver;

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


