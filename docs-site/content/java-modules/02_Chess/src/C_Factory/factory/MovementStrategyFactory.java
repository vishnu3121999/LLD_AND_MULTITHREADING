package C_Factory.factory;

import C_Factory.model.PieceType;
import C_Factory.movement.KingMovementStrategy;
import C_Factory.movement.KnightMovementStrategy;
import C_Factory.movement.LineMovementStrategy;
import C_Factory.movement.MovementStrategy;
import C_Factory.movement.PawnMovementStrategy;

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
