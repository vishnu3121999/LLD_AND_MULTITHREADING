package src.model.game;

import model.Move;
import model.board.Board;
import model.enums.GameStatus;

public interface Game {
    public String getId();

    public void setId(String id);

    public Board getBoard();

    public void setBoard(Board board);

    public String getWhitePlayer();

    public void setWhitePlayer(String whitePlayer);

    public String getBlackPlayer();

    public void setBlackPlayer(String blackPlayer);


    public String getCurrentTurn();

    public void setCurrentTurn(String currentTurn);

    public GameStatus getGameStatus();

    public void setGameStatus(GameStatus gameStatus);

    public boolean validateMove(String playerId, Move move);

    public boolean makeMove(String playerId, Move move);

    public void displayBoard();
}
