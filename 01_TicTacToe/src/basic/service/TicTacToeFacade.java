package basic.service;


import basic.model.Move;
import basic.model.Player;
import basic.model.game.TicTacToeGame;

public class TicTacToeFacade {
    TicTacToeGame game;

    public void startGame(){
        game.start();
    }

    public boolean makeMove(Player player, int row, int col){
        Move move = new Move(row,col,player.getSymbol());
        return game.applyMove(move);
    }

    public TicTacToeFacade(TicTacToeGame game) {
        this.game = game;
    }
}
