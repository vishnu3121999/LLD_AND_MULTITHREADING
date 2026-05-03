package basic.model.game;

import basic.model.Move;
import basic.model.Player;
import basic.model.board.TicTacToeBoard;
import basic.model.enums.GameState;
import basic.model.enums.Symbol;

import java.util.List;
import java.util.Random;

public class AIGame1V1 extends TicTacToeGame{
    Player player;
    int difficulty;

    boolean aiFirstMove;
    Symbol aiSymbol;

    public AIGame1V1(TicTacToeBoard board, Player player, int difficulty, boolean aiFirstMove) {
        super(board, GameState.NOT_STARTED);
        this.difficulty = difficulty;

        Random random = new Random();
        this.aiFirstMove = random.nextBoolean();
        if(player.getSymbol().equals(Symbol.O)){
            aiSymbol = Symbol.X;
        }
        else aiSymbol = Symbol.O;
    }

    @Override
    public void start() {
        gameState = GameState.IN_PROGRESS;
        if(aiFirstMove){
            applyAIMove();
        }
    }

    @Override
    public boolean applyMove(Move move) {
        if(!gameState.equals(GameState.IN_PROGRESS))return false;

        boolean result = board.applyMove(move);
        if(board.hasWinner()){
            gameState = GameState.WON;
            winner = player;
        }
        else if(board.isFull())gameState=GameState.DRAW;

        if(result) {
            applyAIMove();
            if (board.hasWinner()) {
                gameState = GameState.WON;
                winner = null;
            } else if (board.isFull()) gameState = GameState.DRAW;
        }
        return result;
    }

    Move applyAIMove(){
//       Move move = callEngine(difficulty,aiSymbol);
//       board.applyMove(move);
        return null;
    }
}
