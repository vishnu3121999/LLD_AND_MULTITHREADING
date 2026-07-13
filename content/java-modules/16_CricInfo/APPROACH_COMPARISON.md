# Approach Comparison

## Existing Packages

`A_basic` demonstrates teams, players, matches, innings, ball events, live score updates, and score lookup.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- The system supports teams and players.
- A match has two teams and one or more innings.
- An innings tracks runs, wickets, and balls.
- Ball events record batsman, bowler, runs, and wicket result.

Action based points:
- Admin adds teams, players, matches, and innings.
- System records ball events.
- User views score for an innings.

Misc:
- A_basic keeps scoring minimal.
- Overs, strike rotation, player stats, match result, and commentary are deferred.

#### Common Misc

Offline or online:
- Treat as online info system because match data is independently stored and queried.

Extensibility:
- Score rules, tournament support, and player statistics are future extensions.

History and undo:
- BallEvent gives basic history; undo is deferred.

Notifications:
- Live score push updates are future observer/notification concerns.

Exception handling:
- Invalid match/innings/player and cricket rule validations are later concerns.

Concurrency:
- Concurrent score updates are deferred.

### UseCase Diagram

Actors:
- User
- Admin
- System

UseCases:
- addTeam/addPlayer/addMatch(Admin)
- startMatch(Admin) -> mark Match live(System)
- startInnings(Admin) -> create Innings(System) -> add innings id to Match(System)
- recordBall(System) -> create BallEvent(System) -> update Innings score(System)
- getScore(User) -> read Innings(System)

### Class Diagram

Core entities:
- `Team(teamId, name, playerList)` stores player IDs.
- `Player(playerId, name)` stores player data.
- `Match(matchId, teamOneId, teamTwoId, inningsList, matchStatus)` stores match state.
- `Innings(inningsId, battingTeamId, runs, wickets, balls)` owns score state.
- `BallEvent(ballEventId, batsmanId, bowlerId, runs, wicket)` stores ball history.

Method placement:
- `recordBall` belongs in the facade because it creates a ball event and updates innings.
- `recordBall` on `Innings` belongs in the entity because it only updates score fields.
