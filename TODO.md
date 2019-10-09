Should get radar before searching further but need a way to latch it properly
Traps can be random
Are radar and traps taken off?
Track holes we dug, if hole hasn't been dug by us, it's not safe

Closest idle robot to HQ should return for radar
Return for trap
Traps should be buried with some kind of algo -- further away

Check for radars using given data rather than saving

Track opp movements and get nervous if they've been in a spot?
Do things one thing closer to hq -- figure out closest path?

Bury traps in ore>0 -- build out requesting system around this
Bury radar if ore='?'

Trap: only plant in enemy holes with ore in them

Anywhere good on map for radar method

Goto ore stuck on

Make sure search doesn't look for already existing hole

https://www.codingame.com/forum/t/unleash-the-geek-amadeusium-distribution/132188

Track enemies and when they make holes -- can figure out if hole is first since coming from HQ

Likely need some hard refactor to be able to implement the really good stuff

-- Suggest move first to max -- already implemented but there is more to be done for search moves

wall: https://www.codingame.com/replay/413775813

Movement should be optimized to 4 spaces

Trap/radar cooldown is 5 turns, can be optimized for coming back

Track my radars to place them there again -- track intended place

New idea:
Create score for every cell that it can move to - Veins are clustered so score should increase for the 5 cells around it https://github.com/CodinGameCommunity/UnleashTheGeek/blob/b8b955e71ce73ba41854db4ccbce7ae97283570d/src/main/java/com/codingame/utg2019/Game.java

Pressing:

bug: goto search stop

No need for memory just move and dig as needed
As in dig 20,8 will figure out the best path
The upside of your method is you can check things beforehand
The downside is you need to signal intent and do optimizations
Confirm thinking is right and movement isn't being wasted -- should be right

Movement (ignoring HQ) should check 4 closest cardinal directions of target, then distance between robot and all 4 of them selecting the shortest

Intent dig target should be stored in robot

Remember to integrate with movement memory

If distance equal, prefer left hand side

Max call stack still being reached

Rank 621 > Rank 113 (30.05) > (Last night final -- 151, 28.70) 78, 30.01
