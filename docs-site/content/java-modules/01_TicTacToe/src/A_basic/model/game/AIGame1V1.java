package A_basic.model.game;

import A_basic.model.Move;
import A_basic.model.Player;
import A_basic.model.board.TicTacToeBoard;
import A_basic.model.enums.GameState;
import A_basic.model.enums.Symbol;

public class AIGame1V1 extends TicTacToeGame {
    private final Player humanPlayer;
    private final int difficulty;
    private final boolean aiFirstMove;
    private final Symbol aiSymbol;

    public AIGame1V1(TicTacToeBoard board, Player player, int difficulty, boolean aiFirstMove) {
        super(board, GameState.NOT_STARTED);
        this.humanPlayer = player;
        this.difficulty = difficulty;
        this.aiFirstMove = aiFirstMove;
        this.aiSymbol = player.getSymbol().equals(Symbol.O) ? Symbol.X : Symbol.O;
        currentPlayer = humanPlayer;
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
        if (gameState != GameState.IN_PROGRESS) {
            return false;
        }

        boolean applied = board.applyMove(move);
        if (board.hasWinner()) {
            gameState = GameState.WON;
            winner = humanPlayer;
        } else if (board.isFull()) {
            gameState = GameState.DRAW;
        }

        if (applied) {
            applyAIMove();
            if (board.hasWinner()) {
                gameState = GameState.WON;
                winner = null;
            } else if (board.isFull()) {
                gameState = GameState.DRAW;
            }
        }
        return applied;
    }

    private Move applyAIMove() {
        // Move aiMove = callEngine(difficulty, aiSymbol);
        // board.applyMove(aiMove);
        return null;
    }
}
