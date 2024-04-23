# KOII RIDDLES HUNT

Koii Riddles Hunt is a decentralized scavenger hunt game that challenges players to solve riddles and earn rewards.


<img src="https://i.ibb.co/LnJcywW/koii-riddles-hunt-0.png" alt="koii-riddles-hunt-0" border="0" width="1000px">


## TESTNET DEPLOYMENT

#### Task ID: [GBKf2ijKLbjCkrLPtJwuAbdw5FnrLi9ajxU3afF622bd](https://explorer.koii.live/address/GBKf2ijKLbjCkrLPtJwuAbdw5FnrLi9ajxU3afF622bd)

#### App:  https://koii-riddles-hunt.onrender.com


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

## DEPLOYING TASK

```shell

# compile
npm run webpack

# create task
npx @_koii/create-task-cli@latest

```


## HOW TO PLAY

The game is opened for each game/task round:

- Players must solve the riddle and submit proof data to IPFS. If successful, the app should return to players a `Proof CID`.
- Players open Koii node and start the Koii Riddles Task with `Proof CID`.
- The Koii node validates player's proof to evaluate the result and distribute rewards.