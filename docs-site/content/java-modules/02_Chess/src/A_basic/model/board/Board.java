package src.model.board;

import model.piece.Piece;

public interface Board {
    public void print();

    public Piece getPiece(int row, int col);

    public void setPiece(int row, int col, Piece piece);

    public boolean getColor(int row, int col);

    public boolean isInsideBoard(int row, int col);
}
