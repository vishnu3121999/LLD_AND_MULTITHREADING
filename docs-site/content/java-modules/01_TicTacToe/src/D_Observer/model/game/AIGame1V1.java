package D_Observer.model.game;

import D_Observer.model.Move;
import D_Observer.model.Player;
import D_Observer.model.board.TicTacToeBoard;
import D_Observer.model.enums.GameState;
import D_Observer.model.enums.Symbol;
import D_Observer.model.game.winstrategy.WinStrategy;

import java.util.Random;

public class AIGame1V1 extends TicTacToeGame {
    Player player;
    int difficulty;

    boolean aiFirstMove;
    Symbol aiSymbol;

    public AIGame1V1(TicTacToeBoard board, Player player, int difficulty, boolean aiFirstMove, WinStrategy winStrategy) {
        super(board, GameState.NOT_STARTED, winStrategy);
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
        if (winStrategy.hasWinner(board.getGrid())) {
            gameState = GameState.WON;
            winner = player;
        } else if (board.isFull()) gameState = GameState.DRAW;

        if (result) {
            applyAIMove();
            if (winStrategy.hasWinner(board.getGrid())) {
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

