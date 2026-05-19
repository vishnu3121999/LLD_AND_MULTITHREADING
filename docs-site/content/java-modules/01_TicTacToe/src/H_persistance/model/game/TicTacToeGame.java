package H_persistance.model.game;

import H_persistance.model.Move;
import H_persistance.model.Player;
import H_persistance.model.board.TicTacToeBoard;
import H_persistance.model.enums.GameState;
import H_persistance.model.enums.Symbol;
import H_persistance.model.game.winstrategy.WinStrategy;
import H_persistance.observer.GameObserver;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public abstract class TicTacToeGame {
    protected TicTacToeBoard board;
    protected GameState gameState;
    protected Player currentPlayer;
    protected Player winner;
    protected final WinStrategy winStrategy;
    private final List<GameObserver> observers;

    public abstract void start();
    public abstract boolean applyMove(Move move);
    public abstract void undoMove(Move move);

    public TicTacToeGame(TicTacToeBoard board, GameState gameState, WinStrategy winStrategy) {
        this.board = board;
        this.gameState = gameState;
        this.winStrategy = winStrategy;
        this.observers = new CopyOnWriteArrayList<>();
        winner = null;
    }

    public void addObserver(GameObserver observer) {
        if (observer != null) {
            observers.add(observer);
        }
    }

    public void removeObserver(GameObserver observer) {
        observers.remove(observer);
    }

    protected void notifyObservers(String event) {
        for (GameObserver observer : observers) {
            observer.onGameUpdated(event, this);
        }
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


