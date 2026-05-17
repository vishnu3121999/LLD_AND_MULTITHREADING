package src.model.game.factory;

import model.Player;
import model.board.Board;
import model.board.ClassicBoard;
import model.enums.BoardType;
import model.game.ClassicGame;
import model.game.Game;

public class GameFactory {
    public Game getClassicGame(String id, BoardType boardType, Player player1, Player player2){
        Board board = getBoard(boardType);
        return new ClassicGame(id,board,player1.getId(),player2.getId());
    }

    private Board getBoard(BoardType boardType){
        return switch (boardType){
            case CLASSIC -> new ClassicBoard();
            default -> null;  // TODO - create for freestyle board
        };
    }
}
