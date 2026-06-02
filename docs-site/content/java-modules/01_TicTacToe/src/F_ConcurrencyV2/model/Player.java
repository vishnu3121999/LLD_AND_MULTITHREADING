package F_ConcurrencyV2.model;

import F_ConcurrencyV2.model.enums.Symbol;

public class Player {
    String name;
    Symbol symbol;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Symbol getSymbol() {
        return symbol;
    }

    public void setSymbol(Symbol symbol) {
        this.symbol = symbol;
    }

    public Player(String name, Symbol symbol) {
        this.name = name;
        this.symbol = symbol;
    }
}



