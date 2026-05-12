package B_strategy.model.game;

import B_strategy.model.Player;
import B_strategy.model.board.TicTacToeBoard;
import B_strategy.model.enums.GameState;
import B_strategy.model.Move;
import B_strategy.model.game.winstrategy.WinStrategy;

import java.util.Random;

public class ClassicGame1v1 extends TicTacToeGame {
    private final Player playerX;
    private final Player playerO;

    public void start() {
        gameState = GameState.IN_PROGRESS;
    }

    public boolean applyMove(Move move) {
        if (!gameState.equals(GameState.IN_PROGRESS)) return false;
        if (!currentPlayer.getSymbol().equals(move.getSymbol())) return false;

        boolean result = board.applyMove(move);
        if (!result) return false;

        if (winStrategy.hasWinner(board.getGrid())) {
            gameState = GameState.WON;
            winner = currentPlayer;
        } else if (board.isFull()) {
            gameState = GameState.DRAW;
        } else {
            currentPlayer = (currentPlayer == playerX) ? playerO : playerX;
        }
        return true;
    }

    public ClassicGame1v1(TicTacToeBoard board, Player playerX, Player playerO, WinStrategy winStrategy) {
        super(board, GameState.NOT_STARTED, winStrategy);
        this.playerX = playerX;
        this.playerO = playerO;
        Random random = new Random();
        currentPlayer = random.nextBoolean() ? playerX : playerO;
    }
}
