# KOII RIDDLES HUNT

Koii Riddles Hunt is a decentralized scavenger hunt game that challenges players to solve riddles and earn rewards.

<img src="https://i.ibb.co/Pgpx5Wn/screencapture-localhost-5173-2024-04-04-16-30-07.png" alt="Koii Riddles Hunt" border="0" width="1024px">


## GETTING STARTED

To run the app locally:

```shell
cd app
npm run dev
```

```shell
cd task-riddles-hunt
npm start
```


## HOW TO PLAY

The game is opened for each game/task round:

- Player must solve the riddle and submit proof data to IPFS. If successful, the app should return to players a `Proof CID`.
- Players open Koii node and start the Koii Riddles Task with `Proof CID`.
- The Koii node validates player's proof to evaluate the result.