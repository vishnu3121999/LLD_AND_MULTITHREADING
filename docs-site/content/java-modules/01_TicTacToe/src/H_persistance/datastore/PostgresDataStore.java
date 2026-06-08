//package H_persistance.datastore;
//
//import H_persistance.command.CommandInvoker;
//import H_persistance.entity.TicTacToeGameSnapshot;
//import H_persistance.model.game.TicTacToeGame;
//import H_persistance.repository.TicTacToeGameSnapshotRepository;
//
//import java.util.Objects;
//
//public class PostgresDataStore implements IDatastore {
//    private final String gameId;
//    private final TicTacToeGameSnapshotRepository snapshotRepository;
//    private final CommandInvoker commandInvoker;
//    private final TicTacToeGame game;
//
//    public PostgresDataStore(String gameId, TicTacToeGame initialGame,
//                             TicTacToeGameSnapshotRepository snapshotRepository) {
//        this.gameId = requireText(gameId, "gameId");
//        this.snapshotRepository = Objects.requireNonNull(snapshotRepository, "snapshotRepository cannot be null");
//        this.commandInvoker = new CommandInvoker();
//
//        TicTacToeGameSnapshot snapshot = snapshotRepository.findById(gameId).orElse(null);
//        if (snapshot == null) {
//            this.game = Objects.requireNonNull(initialGame, "initialGame cannot be null");
//        } else {
//            this.game = snapshot.toGame();
//            this.commandInvoker.restoreMoveHistory(snapshot.toMoveHistory(), this.game);
//        }
//    }
//
//    @Override
//    public TicTacToeGame getGame() {
//        return game;
//    }
//
//    @Override
//    public CommandInvoker getCommandInvoker() {
//        return commandInvoker;
//    }
//
//    @Override
//    public void save() {
//        snapshotRepository.save(TicTacToeGameSnapshot.fromDomain(gameId, game, commandInvoker));
//    }
//
//    private static String requireText(String value, String name) {
//        if (value == null || value.trim().isEmpty()) {
//            throw new IllegalArgumentException(name + " cannot be blank");
//        }
//        return value;
//    }
//}
