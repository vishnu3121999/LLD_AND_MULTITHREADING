package D_Observer.model.game;

import D_Observer.model.Move;
import D_Observer.model.Player;
import D_Observer.model.board.TicTacToeBoard;
import D_Observer.model.enums.GameState;
import D_Observer.model.game.winstrategy.WinStrategy;

import java.util.Random;

public class ClassicGame1v1 extends TicTacToeGame {
    private final Player playerX;
    private final Player playerO;

    public void start() {
        gameState = GameState.IN_PROGRESS;
        notifyObservers("Game started");
    }

    public boolean applyMove(Move move) {
        if (!gameState.equals(GameState.IN_PROGRESS)) return false;
        if (!currentPlayer.getSymbol().equals(move.getSymbol())) return false;

        boolean result = board.applyMove(move);
        if (!result) return false;

        if (winStrategy.hasWinner(board.getGrid())) {
            gameState = GameState.WON;
            winner = currentPlayer;
            notifyObservers(currentPlayer.getName() + " won the game");
        } else if (board.isFull()) {
            gameState = GameState.DRAW;
            notifyObservers("Game ended in a draw");
        } else {
            currentPlayer = (currentPlayer == playerX) ? playerO : playerX;
            notifyObservers("Move applied by " + move.getSymbol());
        }
        return true;
    }


    public void undoMove(Move move) {
        if (!board.removeMove(move)) {
            return;
        }
        currentPlayer = getPlayerForSymbol(move.getSymbol(), playerX, playerO);
        winner = null;
        gameState = GameState.IN_PROGRESS;
        notifyObservers("Move undone");
    }

    public ClassicGame1v1(TicTacToeBoard board, Player playerX, Player playerO, WinStrategy winStrategy) {
        super(board, GameState.NOT_STARTED, winStrategy);
        this.playerX = playerX;
        this.playerO = playerO;
        Random random = new Random();
        currentPlayer = random.nextBoolean() ? playerX : playerO;
    }
}

