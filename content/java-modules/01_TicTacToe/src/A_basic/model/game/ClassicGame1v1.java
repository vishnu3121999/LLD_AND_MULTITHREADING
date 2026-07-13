package A_basic.model.game;

import A_basic.model.Move;
import A_basic.model.Player;
import A_basic.model.board.TicTacToeBoard;
import A_basic.model.enums.GameState;

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

        if (board.hasWinner()) {
            gameState = GameState.WON;
            winner = currentPlayer;
        } else if (board.isFull()) {
            gameState = GameState.DRAW;
        } else {
            currentPlayer = (currentPlayer == playerX) ? playerO : playerX;
        }
        return true;
    }

    public ClassicGame1v1(TicTacToeBoard board, Player playerX, Player playerO) {
        super(board, GameState.NOT_STARTED);
        this.playerX = playerX;
        this.playerO = playerO;
        Random random = new Random();
        currentPlayer = random.nextBoolean() ? playerX : playerO;
    }
}
