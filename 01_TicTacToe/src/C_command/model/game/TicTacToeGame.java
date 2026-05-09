package C_command.model.game;

import C_command.model.Move;
import C_command.model.Player;
import C_command.model.board.TicTacToeBoard;
import C_command.model.enums.GameState;
import C_command.model.enums.Symbol;

public abstract class TicTacToeGame {
    protected TicTacToeBoard board;
    protected GameState gameState;
    protected Player currentPlayer;
    protected Player winner;

    public abstract void start();
    public abstract boolean applyMove(Move move);
    public abstract void undoMove(Move move);

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

    protected Player getPlayerForSymbol(Symbol symbol, Player playerX, Player playerO) {
        return playerX.getSymbol().equals(symbol) ? playerX : playerO;
    }
}
