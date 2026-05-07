package basic_strategy.model.game;

import basic_strategy.model.Move;
import basic_strategy.model.Player;
import basic_strategy.model.board.TicTacToeBoard;
import basic_strategy.model.enums.GameState;

import java.util.Random;

public class ClassicGame1v1 extends TicTacToeGame {
    private final Player playerX;
    private final Player playerO;

    public void start() {
        gameState = GameState.IN_PROGRESS;
    }

    public boolean applyMove(Move move) {
        if (!gameState.equals(GameState.IN_PROGRESS)) return false;
        if (currentPlayer.getSymbol().equals(move.getSymbol())) {
            boolean result = board.applyMove(move);
            if (board.hasWinner()) {
                gameState = GameState.WON;
                winner = currentPlayer;
            } else if (board.isFull()) gameState = GameState.DRAW;
            if (result)
                currentPlayer = (currentPlayer == playerX) ? playerO : playerX;
            return result;
        } else return false;
    }

    public ClassicGame1v1(TicTacToeBoard board, Player playerX, Player playerO) {
        super(board, GameState.NOT_STARTED);
        this.playerX = playerX;
        this.playerO = playerO;
        Random random = new Random();
        currentPlayer = random.nextBoolean() ? playerX : playerO;
    }
}
