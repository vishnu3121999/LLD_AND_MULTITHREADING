package F_ConcurrencyV2.datastore;

import F_ConcurrencyV2.command.CommandInvoker;
import F_ConcurrencyV2.model.game.TicTacToeGame;

public interface IDatastore {
    TicTacToeGame getGame();
    CommandInvoker getCommandInvoker();
}


