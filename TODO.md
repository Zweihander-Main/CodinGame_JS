# Coders Strike Back

# Unleash the Geek

    	// this will require decoupling memory move cell and memory dig cell
    	// will need logic for arrived but wanted to dig at different cell
    	// trying it with equal weighting per adjacent cells?

Radar sprayed, radar edge, radar would be sprayed all should have algos for them that are efficient

Dig latches should happen on cells

Radar idea: stick it center with closest to center robot requesting, put other robots around field of view of theoretical radar

Generate diggraph once -- possibly on the grid
Could keep a perpetual dig graph going with scoring system updated in real time -- grid would be responsible

If robot carrying trap/radar signals intent to dig, robot calculating afterwards may also signal to dig despite trap/radar there

Re-evaluate every turn

Radar should try and follow edge of previous radar -- maximize edge contact

destination memory latching unsure of

More complex system -- movement to cells where you can change the dig target are excellent

Verify mind change then can dig in cardinal direction while staying in same cell

Need to weight further moves away harder when placing radar if there is sufficient revealed ore on the map -- perhaps calculate total ore available on map?

Scoring should be on cardinal cells, not just single cells

Or redo scoring -- rate all cells then take into account movement?

Shouldn't all positive be counted as movement?

The movement should be greedy -- the scoring assuming (including calculating moves back to hq for scoring)

Can generate two graphs -- one with scores assigned to probs and then do the rest per robot

Start by implementing value calculation for bigger radius -- 5 cells

You're getting creamed if there is a vein in the early half of the map

movement latch can come back if digging and movement are different

Check ore prob of each cell and calculate if all the high prob cells have radar attached

You can figure out where opp radar and bombs are placed
Target radars, avoid bombs -- probabilties is what you can do -- doesn't have to be cardinal, can be direction from which they came from (make that configurable)

Track opp movements and get nervous if they've been in a spot?

Bury traps in ore>0 -- build out requesting system around this
Trap: only plant in enemy holes with ore in them

Make sure search doesn't look for already existing hole

Track enemies and when they make holes -- can figure out if hole is first since coming from HQ

wall: https://www.codingame.com/replay/413775813

Movement should be optimized to 4 spaces

Trap/radar cooldown is 5 turns, can be optimized for coming back

Change to different mined hole if next to or on top of enemy
Remember to integrate with movement memory

Add in go to hq for radar modifier

Verify http://chat.codingame.com/pastebin/028dddfe-88aa-47ab-8a2e-172a26438253 and http://chat.codingame.com/pastebin/1edd7d68-0033-4762-87ff-cb526433e189

Pressing:

"my bot objects have a field containing their current task
when it's complete, they fetch a new one" -- is that a better way to do it? -- queue

Radar should stop placement after algo point, not hard coded -- perhaps add in no need clause as well?

Two with radar going to the same spot -- need last minute check or neg if too close or latch for radar or something

Multi ore latching -- better implementation or get rid of move latching -- maybe ok now? Need debugging

No need for memory just move and dig as needed
As in dig 20,8 will figure out the best path
The upside of your method is you can check things beforehand
The downside is you need to signal intent and do optimizations
Confirm thinking is right and movement isn't being wasted -- should be right

Movement (ignoring HQ) should check 4 closest cardinal directions of target, then distance between robot and all 4 of them selecting the shortest

Intent dig target should be stored in robot -- queue?

If distance equal, prefer left hand side

general function export rather than attaching to classes

1. Rank 621
2. Rank 113, 30.05
3. 78, 30.01-28.73
4. 128, 28
5. 116, 28.87
6. (With traps) 1 38

Silver:

7. 178, 20
8. 59, 23.30
9. 22, 24.46 -> 73 22.41
10. 80, 22
