package H_persistance.datastore;

import H_persistance.command.CommandInvoker;
import H_persistance.model.game.TicTacToeGame;

public interface IDatastore {
    TicTacToeGame getGame();
    CommandInvoker getCommandInvoker();
    void save();
}
