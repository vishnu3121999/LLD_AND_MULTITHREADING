package F_ConcurrencyV2.command;

public interface Command {
    boolean execute();
    boolean undo();
}



