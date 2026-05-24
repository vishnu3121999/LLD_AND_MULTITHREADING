package F_COR.service;

import F_COR.board.ChessBoard;
import F_COR.memento.GameMemento;
import F_COR.model.Color;
import F_COR.model.GameState;
import F_COR.model.Move;
import F_COR.model.Player;

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

    public GameMemento createMemento() {
        return new GameMemento(board.createSnapshot(), gameState, currentPlayer, winner);
    }

    public void restore(GameMemento memento) {
        board.restore(memento.getBoardSnapshot());
        gameState = memento.getGameState();
        currentPlayer = memento.getCurrentPlayer();
        winner = memento.getWinner();
    }

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


