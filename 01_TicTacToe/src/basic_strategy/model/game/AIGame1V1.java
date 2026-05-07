package basic_strategy.model.game;

import basic_strategy.model.Move;
import basic_strategy.model.Player;
import basic_strategy.model.board.TicTacToeBoard;
import basic_strategy.model.enums.GameState;
import basic_strategy.model.enums.Symbol;

import java.util.Random;

public class AIGame1V1 extends TicTacToeGame {
    Player player;
    int difficulty;

    boolean aiFirstMove;
    Symbol aiSymbol;

    public AIGame1V1(TicTacToeBoard board, Player player, int difficulty, boolean aiFirstMove) {
        super(board, GameState.NOT_STARTED);
        this.difficulty = difficulty;

        Random random = new Random();
        this.aiFirstMove = random.nextBoolean();
        if (player.getSymbol().equals(Symbol.O)) {
            aiSymbol = Symbol.X;
        } else aiSymbol = Symbol.O;
        currentPlayer = player;
    }

    @Override
    public void start() {
        gameState = GameState.IN_PROGRESS;
        if (aiFirstMove) {
            applyAIMove();
        }
    }

    @Override
    public boolean applyMove(Move move) {
        if (!gameState.equals(GameState.IN_PROGRESS)) return false;

        boolean result = board.applyMove(move);
        if (board.hasWinner()) {
            gameState = GameState.WON;
            winner = player;
        } else if (board.isFull()) gameState = GameState.DRAW;

        if (result) {
            applyAIMove();
            if (board.hasWinner()) {
                gameState = GameState.WON;
                winner = null;
            } else if (board.isFull()) gameState = GameState.DRAW;
        }
        return result;
    }

    Move applyAIMove() {
        return null;
    }
}
