package B_strategy.model.game;

import B_strategy.model.Player;
import B_strategy.model.Move;
import B_strategy.model.board.TicTacToeBoard;
import B_strategy.model.enums.GameState;
import B_strategy.model.game.winstrategy.WinStrategy;

public abstract class TicTacToeGame {
    protected TicTacToeBoard board;
    protected GameState gameState;
    protected Player currentPlayer;
    protected Player winner;
    protected final WinStrategy winStrategy;

    public abstract void start();
    public abstract boolean applyMove(Move move);

    public TicTacToeGame(TicTacToeBoard board, GameState gameState, WinStrategy winStrategy) {
        this.board = board;
        this.gameState = gameState;
        this.winStrategy = winStrategy;
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
