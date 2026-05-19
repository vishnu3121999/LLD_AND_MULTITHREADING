package G_Composite.datastore;

import G_Composite.command.CommandInvoker;
import G_Composite.model.game.TicTacToeGame;

public interface IDatastore {
    TicTacToeGame getGame();
    CommandInvoker getCommandInvoker();
}
