package H_concurrency.service;

import H_concurrency.board.ChessBoard;
import H_concurrency.memento.GameMemento;
import H_concurrency.model.Color;
import H_concurrency.model.GameState;
import H_concurrency.model.Move;
import H_concurrency.model.Player;

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

    public boolean isCurrentPlayer(Player player) {
        return isSamePlayer(currentPlayer, player);
    }

    protected boolean isSamePlayer(Player first, Player second) {
        if (first == null || second == null) {
            return false;
        }
        return first.getPlayerId().equals(second.getPlayerId());
    }
}




