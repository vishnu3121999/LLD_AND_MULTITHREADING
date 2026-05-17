package src.model.game;

import model.*;
import model.board.Board;
import model.enums.GameStatus;
import model.piece.King;
import model.piece.Piece;

public class ClassicGame implements Game{

    public ClassicGame(String id, Board board, String whitePlayer, String blackPlayer) {
        this.id = id;
        this.board = board;
        this.whitePlayer = whitePlayer;
        this.blackPlayer = blackPlayer;
        this.currentTurn = whitePlayer;
        this.gameStatus = GameStatus.IN_PROGRESS;
    }

    private String id;
    private Board board;
    private String whitePlayer;
    private String blackPlayer;
    private String currentTurn;
    private GameStatus gameStatus;

    public boolean validateMove(String playerId, Move move){
        if (gameStatus != GameStatus.IN_PROGRESS) {
            return false;
        }
        if (!currentTurn.equals(playerId)) {
            return false;
        }
        if (!board.isInsideBoard(move.getSrcRow(), move.getSrcCol()) || !board.isInsideBoard(move.getDestRow(), move.getDestCol())) {
            return false;
        }
        Piece piece = board.getPiece(move.getSrcRow(), move.getSrcCol());
        if (piece == null) {
            return false;
        }
        boolean isWhiteTurn = whitePlayer.equals(playerId);
        if (piece.isWhite() != isWhiteTurn) {
            return false;
        }
        return piece.canMove(board,move);
    }

    public boolean makeMove(String playerId, Move move) {
        if (!validateMove(playerId, move)) {
            return false;
        }

        Piece sourcePiece = board.getPiece(move.getSrcRow(), move.getSrcCol());
        Piece capturedPiece = board.getPiece(move.getDestRow(), move.getDestCol());
        board.setPiece(move.getDestRow(), move.getDestCol(), sourcePiece);
        board.setPiece(move.getSrcRow(), move.getSrcCol(), null);

        updateGameStatus(capturedPiece);
        if (gameStatus == GameStatus.IN_PROGRESS) {
            currentTurn = currentTurn.equals(whitePlayer) ? blackPlayer : whitePlayer;
        }
        return true;
    }

    public void displayBoard() {
        board.print();
    }

    private void updateGameStatus(Piece capturedPiece) {
        if (!(capturedPiece instanceof King)) {
            return;
        }
        gameStatus = capturedPiece.isWhite() ? GameStatus.BLACK_WIN : GameStatus.WHITE_WIN;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Board getBoard() {
        return board;
    }

    public void setBoard(Board board) {
        this.board = board;
    }

    public String getWhitePlayer() {
        return whitePlayer;
    }

    public void setWhitePlayer(String whitePlayer) {
        this.whitePlayer = whitePlayer;
    }

    public String getBlackPlayer() {
        return blackPlayer;
    }

    public void setBlackPlayer(String blackPlayer) {
        this.blackPlayer = blackPlayer;
    }

    public String getCurrentTurn() {
        return currentTurn;
    }

    public void setCurrentTurn(String currentTurn) {
        this.currentTurn = currentTurn;
    }

    public GameStatus getGameStatus() {
        return gameStatus;
    }

    public void setGameStatus(GameStatus gameStatus) {
        this.gameStatus = gameStatus;
    }
}
