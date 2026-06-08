# Approach Comparison

## Existing Packages

`A_basic` demonstrates users, groups, equal expense splits, generated split records, and simple balances between users.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- The system supports users and groups.
- A group has members and expenses.
- An expense has splits.
- Balances represent what one user owes another.

Action based points:
- Admin adds users, groups, and group members.
- User adds an expense paid by one member and shared by participants.
- System creates equal splits and updates balances.

Misc:
- A_basic only supports equal split.
- Percentage/exact split, settlement, simplification, and validation are deferred.

#### Common Misc

Offline or online:
- Treat as online because users, groups, expenses, splits, and balances are stored independently.

Extensibility:
- Split calculation can become Strategy later.

History and undo:
- Expense history exists; undo is deferred.

Notifications:
- Expense notifications are later concerns.

Exception handling:
- Missing users/groups and invalid amounts are later validations.

Concurrency:
- Concurrent expense updates to the same balance are deferred.

### UseCase Diagram

Actors:
- User
- Admin
- System

UseCases:
- addUser/addGroup/addMember(Admin)
- addExpense(User) -> create Expense(System) -> create equal Splits(System) -> update Balance(System) -> attach expense to Group(System)

### Class Diagram

Core entities:
- `User(userId, name)` stores member data.
- `Group(groupId, name, userList, expenseList)` stores member and expense IDs.
- `Expense(expenseId, paidByUserId, amount, splitList, expenseStatus)` stores expense details.
- `Split(splitId, userId, amount)` stores one participant share.
- `Balance(balanceId, fromUserId, toUserId, amount)` stores amount owed.

Method placement:
- `addExpense` belongs in the facade because it coordinates expense, splits, group, and balances.
- `updateBalance` is a facade system method in A_basic.
- `addAmount` belongs in `Balance` because it only mutates balance state.
