package K_persistence.entity;

import K_persistence.flyweight.PieceFlyweightFactory;
import K_persistence.model.Color;
import K_persistence.model.Piece;
import K_persistence.model.PieceType;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

final class SnapshotCodec {
    private SnapshotCodec() {
    }

    static String encodeBoard(Piece[][] board) {
        List<String> rows = new ArrayList<>();
        for (Piece[] row : board) {
            List<String> cells = new ArrayList<>();
            for (Piece piece : row) {
                cells.add(piece == null ? "." : piece.getType().name() + ":" + piece.getColor().name());
            }
            rows.add(String.join(",", cells));
        }
        return String.join(";", rows);
    }

    static Piece[][] decodeBoard(String value, int boardSize) {
        Piece[][] board = new Piece[boardSize][boardSize];
        if (value == null || value.trim().isEmpty()) {
            return board;
        }

        String[] rows = value.split(";");
        for (int row = 0; row < rows.length; row++) {
            String[] cells = rows[row].split(",");
            for (int col = 0; col < cells.length; col++) {
                if (".".equals(cells[col])) {
                    continue;
                }
                String[] pieceFields = cells[col].split(":");
                board[row][col] = PieceFlyweightFactory.getPiece(
                        PieceType.valueOf(pieceFields[0]),
                        Color.valueOf(pieceFields[1])
                );
            }
        }
        return board;
    }

    static String encodeKeys(Set<String> keys) {
        if (keys == null || keys.isEmpty()) {
            return "";
        }
        List<String> sortedKeys = new ArrayList<>(keys);
        Collections.sort(sortedKeys);
        return String.join(",", sortedKeys);
    }

    static Set<String> decodeKeys(String value) {
        Set<String> keys = new HashSet<>();
        if (value == null || value.trim().isEmpty()) {
            return keys;
        }
        Collections.addAll(keys, value.split(","));
        return keys;
    }
}
