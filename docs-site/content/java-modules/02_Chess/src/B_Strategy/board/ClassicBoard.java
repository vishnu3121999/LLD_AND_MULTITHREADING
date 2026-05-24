package B_Strategy.board;

import B_Strategy.model.Color;
import B_Strategy.model.Piece;
import B_Strategy.model.PieceType;

public class ClassicBoard extends ChessBoard {
    public ClassicBoard() {
        super(8);
        setupInitialPosition();
    }

    private void setupInitialPosition() {
        setupBackRank(0, Color.BLACK);
        setupPawns(1, Color.BLACK);
        setupPawns(6, Color.WHITE);
        setupBackRank(7, Color.WHITE);
    }

    private void setupBackRank(int row, Color color) {
        placePiece(row, 0, new Piece(PieceType.ROOK, color));
        placePiece(row, 1, new Piece(PieceType.KNIGHT, color));
        placePiece(row, 2, new Piece(PieceType.BISHOP, color));
        placePiece(row, 3, new Piece(PieceType.QUEEN, color));
        placePiece(row, 4, new Piece(PieceType.KING, color));
        placePiece(row, 5, new Piece(PieceType.BISHOP, color));
        placePiece(row, 6, new Piece(PieceType.KNIGHT, color));
        placePiece(row, 7, new Piece(PieceType.ROOK, color));
    }

    private void setupPawns(int row, Color color) {
        for (int col = 0; col < 8; col++) {
            placePiece(row, col, new Piece(PieceType.PAWN, color));
        }
    }
}
