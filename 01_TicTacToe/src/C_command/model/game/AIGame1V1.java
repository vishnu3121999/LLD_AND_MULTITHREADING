package C_command.model.game;

import C_command.model.Move;
import C_command.model.Player;
import C_command.model.board.TicTacToeBoard;
import C_command.model.enums.GameState;
import C_command.model.enums.Symbol;

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

    @Override
    public void undoMove(Move move) {
        if (!board.removeMove(move)) {
            return;
        }
        gameState = GameState.IN_PROGRESS;
        winner = null;
    }

    Move applyAIMove(){
//       Move move = callEngine(difficulty,aiSymbol);
//       board.applyMove(move);
        return null;
    }
}
