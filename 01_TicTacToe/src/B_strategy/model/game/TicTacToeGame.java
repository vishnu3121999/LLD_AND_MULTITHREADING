package B_strategy.model.game;

import B_strategy.model.Player;
import B_strategy.model.board.TicTacToeBoard;
import B_strategy.model.enums.GameState;

public abstract class TicTacToeGame {
    protected TicTacToeBoard board;
    protected GameState gameState;
    protected Player currentPlayer;
    protected Player winner;

    public abstract void start();
    public abstract boolean applyMove(B_strategy.model.Move move);

    public TicTacToeGame(TicTacToeBoard board, GameState gameState) {
        this.board = board;
        this.gameState = gameState;
        winner = null;
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

    public TicTacToeBoard getBoard() {
        return board;
    }

    public void setBoard(TicTacToeBoard board) {
        this.board = board;
    }

    public GameState getGameState() {
        return gameState;
    }

    public void setGameState(GameState gameState) {
        this.gameState = gameState;
    }
}
