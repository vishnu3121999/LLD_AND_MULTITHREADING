package D_Memento.factory;

import D_Memento.model.PieceType;
import D_Memento.movement.KingMovementStrategy;
import D_Memento.movement.KnightMovementStrategy;
import D_Memento.movement.LineMovementStrategy;
import D_Memento.movement.MovementStrategy;
import D_Memento.movement.PawnMovementStrategy;

public class MovementStrategyFactory {
    public MovementStrategy getStrategy(PieceType type) {
        switch (type) {
            case KING:
                return new KingMovementStrategy();
            case QUEEN:
                return new LineMovementStrategy(true, true);
            case ROOK:
                return new LineMovementStrategy(true, false);
            case BISHOP:
                return new LineMovementStrategy(false, true);
            case KNIGHT:
                return new KnightMovementStrategy();
            case PAWN:
                return new PawnMovementStrategy();
            default:
                throw new IllegalArgumentException("Unsupported piece type: " + type);
        }
    }
}

