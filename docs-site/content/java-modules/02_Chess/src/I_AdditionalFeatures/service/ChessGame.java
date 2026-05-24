package I_AdditionalFeatures.service;

import I_AdditionalFeatures.board.ChessBoard;
import I_AdditionalFeatures.memento.GameMemento;
import I_AdditionalFeatures.model.Color;
import I_AdditionalFeatures.model.GameState;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.model.Player;

import java.util.HashSet;
import java.util.Set;

public abstract class ChessGame {
    protected String gameId;
    protected ChessBoard board;
    protected GameState gameState;
    protected Player currentPlayer;
    protected Player winner;
    protected Move lastMove;
    protected Set<String> movedPositionKeys;

    protected ChessGame(String gameId, ChessBoard board, GameState gameState) {
        this.gameId = gameId;
        this.board = board;
        this.gameState = gameState;
        this.winner = null;
        this.lastMove = null;
        this.movedPositionKeys = new HashSet<>();
    }

    public abstract void start();

    public abstract boolean move(Move move);

    public abstract Color getPlayerColor(Player player);

    public abstract Player getPlayer(Color color);

    public GameMemento createMemento() {
        return new GameMemento(board.createSnapshot(), gameState, currentPlayer, winner, lastMove, movedPositionKeys);
    }

    public void restore(GameMemento memento) {
        board.restore(memento.getBoardSnapshot());
        gameState = memento.getGameState();
        currentPlayer = memento.getCurrentPlayer();
        winner = memento.getWinner();
        lastMove = memento.getLastMove();
        movedPositionKeys = memento.getMovedPositionKeys();
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

    public Move getLastMove() {
        return lastMove;
    }

    public void setLastMove(Move lastMove) {
        this.lastMove = lastMove;
    }

    public boolean hasPositionMoved(I_AdditionalFeatures.model.Position position) {
        return movedPositionKeys.contains(positionKey(position));
    }

    public void markPositionMoved(I_AdditionalFeatures.model.Position position) {
        movedPositionKeys.add(positionKey(position));
    }

    private String positionKey(I_AdditionalFeatures.model.Position position) {
        return position.getRow() + ":" + position.getCol();
    }

    protected boolean isSamePlayer(Player first, Player second) {
        if (first == null || second == null) {
            return false;
        }
        return first.getPlayerId().equals(second.getPlayerId());
    }
}





