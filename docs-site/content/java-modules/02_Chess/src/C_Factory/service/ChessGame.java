package C_Factory.service;

import C_Factory.board.ChessBoard;
import C_Factory.model.Color;
import C_Factory.model.GameState;
import C_Factory.model.Move;
import C_Factory.model.Player;

public abstract class ChessGame {
    protected String gameId;
    protected ChessBoard board;
    protected GameState gameState;
    protected Player currentPlayer;
    protected Player winner;

    protected ChessGame(String gameId, ChessBoard board, GameState gameState) {
        this.gameId = gameId;
        this.board = board;
        this.gameState = gameState;
        this.winner = null;
    }

    public abstract void start();

    public abstract boolean move(Move move);

    public abstract Color getPlayerColor(Player player);

    public String getGameId() {
        return gameId;
    }

    public void setGameId(String gameId) {
        this.gameId = gameId;
    }

    public ChessBoard getBoard() {
        return board;
    }

    public void setBoard(ChessBoard board) {
        this.board = board;
    }

    public GameState getGameState() {
        return gameState;
    }

    public void setGameState(GameState gameState) {
        this.gameState = gameState;
    }

    public Player getCurrentPlayer() {
        return currentPlayer;
    }

    public void setCurrentPlayer(Player currentPlayer) {
        this.currentPlayer = currentPlayer;
    }

    public Player getWinner() {
        return winner;
    }

    public void setWinner(Player winner) {
        this.winner = winner;
    }
}
