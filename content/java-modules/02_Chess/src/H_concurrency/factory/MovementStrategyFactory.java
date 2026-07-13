package H_concurrency.factory;

import H_concurrency.model.PieceType;
import H_concurrency.movement.KingMovementStrategy;
import H_concurrency.movement.KnightMovementStrategy;
import H_concurrency.movement.LineMovementStrategy;
import H_concurrency.movement.MovementStrategy;
import H_concurrency.movement.PawnMovementStrategy;

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




