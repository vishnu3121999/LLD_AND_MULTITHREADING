package H_persistance.config;

import H_persistance.datastore.IDatastore;
import H_persistance.datastore.PostgresDataStore;
import H_persistance.model.Player;
import H_persistance.model.board.ClassicBoard;
import H_persistance.model.enums.Symbol;
import H_persistance.model.game.ClassicGame1v1;
import H_persistance.model.game.TicTacToeGame;
import H_persistance.model.game.winstrategy.ClassicWinStrategy;
import H_persistance.repository.TicTacToeGameSnapshotRepository;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PersistenceConfig {
    @Bean
    public IDatastore datastore(TicTacToeGameSnapshotRepository snapshotRepository) {
        Player playerX = new Player("Player-1", Symbol.X);
        Player playerO = new Player("Player-2", Symbol.O);
        TicTacToeGame game = new ClassicGame1v1(new ClassicBoard(3), playerX, playerO, new ClassicWinStrategy());
        return new PostgresDataStore("classic-game", game, snapshotRepository);
    }
}
