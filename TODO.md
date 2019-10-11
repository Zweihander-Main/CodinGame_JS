You can figure out where opp radar and bombs are placed
Target radars, avoid bombs

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

1. Rank 621
2. Rank 113, 30.05
3. 78, 30.01-28.73
4. 128, 28
5. 116, 28.87
6. (With traps) Yeah baby 1 38 -- Silver: Rank 178 20
7.
