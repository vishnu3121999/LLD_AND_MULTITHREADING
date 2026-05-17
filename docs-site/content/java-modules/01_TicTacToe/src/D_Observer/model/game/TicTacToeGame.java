package D_Observer.model.game;

import D_Observer.model.Move;
import D_Observer.model.Player;
import D_Observer.model.board.TicTacToeBoard;
import D_Observer.model.enums.GameState;
import D_Observer.model.enums.Symbol;
import D_Observer.model.game.winstrategy.WinStrategy;
import D_Observer.observer.GameObserver;

import java.util.ArrayList;
import java.util.List;

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
        this.observers = new ArrayList<>();
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

