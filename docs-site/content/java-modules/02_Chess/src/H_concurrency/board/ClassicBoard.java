package H_concurrency.board;

import H_concurrency.factory.PieceFactory;
import H_concurrency.model.Color;
import H_concurrency.model.PieceType;

public class ClassicBoard extends ChessBoard {
    private final PieceFactory pieceFactory;

    public ClassicBoard() {
        super(8);
        this.pieceFactory = new PieceFactory();
        setupInitialPosition();
    }

    private void setupInitialPosition() {
        setupBackRank(0, Color.BLACK);
        setupPawns(1, Color.BLACK);
        setupPawns(6, Color.WHITE);
        setupBackRank(7, Color.WHITE);
    }

    private void setupBackRank(int row, Color color) {
        placePiece(row, 0, pieceFactory.create(PieceType.ROOK, color));
        placePiece(row, 1, pieceFactory.create(PieceType.KNIGHT, color));
        placePiece(row, 2, pieceFactory.create(PieceType.BISHOP, color));
        placePiece(row, 3, pieceFactory.create(PieceType.QUEEN, color));
        placePiece(row, 4, pieceFactory.create(PieceType.KING, color));
        placePiece(row, 5, pieceFactory.create(PieceType.BISHOP, color));
        placePiece(row, 6, pieceFactory.create(PieceType.KNIGHT, color));
        placePiece(row, 7, pieceFactory.create(PieceType.ROOK, color));
    }

    private void setupPawns(int row, Color color) {
        for (int col = 0; col < 8; col++) {
            placePiece(row, col, pieceFactory.create(PieceType.PAWN, color));
        }
    }
}




