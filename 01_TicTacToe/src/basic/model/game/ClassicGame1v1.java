package basic.model.game;

import basic.model.Move;
import basic.model.Player;
import basic.model.board.TicTacToeBoard;
import basic.model.enums.GameState;

import java.util.Random;


public class ClassicGame1v1 extends TicTacToeGame{
    private Player playerX;
    private Player playerO;
    private Player currentPlayer;

    public void start(){
        gameState = GameState.IN_PROGRESS;
    }

    public boolean applyMove(Move move){
        if(!gameState.equals(GameState.IN_PROGRESS))return false;
        if(currentPlayer.getSymbol().equals(move.getSymbol())) {
            boolean result = board.applyMove(move);
            if(board.hasWinner()){
                gameState = GameState.WON;
                winner = currentPlayer;
            }
            else if(board.isFull())gameState=GameState.DRAW;
            if(result)
                currentPlayer = (currentPlayer == playerX) ? playerO : playerX;
            return result;
        }
        else return false;
    }

    public ClassicGame1v1(TicTacToeBoard board, Player playerX, Player playerO) {
        super(board, GameState.NOT_STARTED);
        this.playerX = playerX;
        this.playerO = playerO;
        currentPlayer = playerX;
    }
}

