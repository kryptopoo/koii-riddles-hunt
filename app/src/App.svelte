<script lang="ts">
  import { fade } from "svelte/transition";
  import { SyncLoader } from "svelte-loading-spinners";
  import { SpheronClient, ProtocolEnum } from "@spheron/storage";
  import { upload } from "@spheron/browser-upload";
  import toast, { Toaster } from "svelte-french-toast";
  import { onMount } from "svelte";
  import KoiiService from "./lib/KoiiService";
  import TimeCountdown from "./lib/TimeCountdown.svelte";

  const client = new SpheronClient({
    token: import.meta.env.VITE_SPHERON_STORAGE_KEY || "",
    apiUrl: "/spheron_api",
  });

  let round = 0;
  let roundStartTime = 0;
  let answer: string = "";
  let address: string = "";
  let proofCid: string = "";
  let errorMsg: string = "";
  let loading = false;

  // TODO: keep this in secret
  const riddles = [
    {
      id: 1,
      question: "What can travel around the world while staying in a corner?",
      correct_answer: "Stamp",
    },
    {
      id: 2,
      question:
        "At night they come without being fetched, and by day they are lost without being stolen.",
      correct_answer: "Stars",
    },
    {
      id: 3,
      question: "Forward I am heavy, but backward I am not. What am I?",
      correct_answer: "Ton",
    },
    {
      id: 4,
      question:
        "I am a solitary word, 5 letters long. Behead me once, I am the same. Behead me again, I am still the same.",
      correct_answer: "Alone",
    },
    {
      id: 5,
      question:
        "I’m light as a feather, yet the strongest man can’t hold me for more than 5 minutes. What am I?",
      correct_answer: "Breath",
    },
    {
      id: 6,
      question:
        "I am very easy to get into, but it is hard to get out of me. What am I?",
      correct_answer: "Trouble",
    },
    {
      id: 7,
      question:
        "What heavy seven letter word can you take two away from and be left with eight?",
      correct_answer: "Weights",
    },
    {
      id: 9,
      question:
        "I am the beginning of the end, the end of every place. I am the beginning of eternity, the end of time and space. What am I?",
      correct_answer: "E",
    },
    {
      id: 10,
      question:
        "Alone I am 24th, with a friend I am 20. Add another friend and I am naughty.",
      correct_answer: "X",
    },
    {
      id: 11,
      question:
        "Give me food and I will live. Give me water, and I will die. What am I?",
      correct_answer: "Fire",
    },
  ];
  let riddle = { question: "", correct_answer: "" };

  function submit() {
    toast.promise(uploadProof(), {
      loading: "Submiting proof...",
      success: "Proof saved!",
      error: "Could not save.",
    });
  }

  async function uploadProof() {
    const jsn = JSON.stringify({
      round: round,
      question: riddle.question,
      correct_answer: riddle.correct_answer.toLowerCase().trim(),
      answer: answer.toLowerCase().trim(),
      address: address,
    });
    const blob = new Blob([jsn], { type: "application/json" });
    const file: File = new File([blob], "data.json");

    let currentlyUploaded = 0;

    const bucketName = "koii-riddles-hunt";
    const protocol = ProtocolEnum.IPFS;
    const { uploadToken } = await client.createSingleUploadToken({
      name: bucketName,
      protocol,
    });
    console.log("uploadToken", uploadToken);

    const { uploadId, bucketId, protocolLink, dynamicLinks } = await upload(
      [file],
      {
        token: uploadToken,
        onChunkUploaded: (uploadedSize, totalSize) => {
          currentlyUploaded += uploadedSize;
          console.log(`Uploaded ${currentlyUploaded} of ${totalSize} Bytes.`);
        },
      }
    );

    proofCid = protocolLink
      .replace("https://", "")
      .replace(".ipfs.sphn.link", "");
    console.log("uploadId", uploadId);
    console.log("protocolLink", protocolLink);
    console.log("proofCid", proofCid);
  }

  onMount(async () => {
    // // get round info from koii node
    // const roundRes = await fetch(
    //   `${import.meta.env.VITE_NODE_API_URL || ""}/round`
    // );
    // const roundRs = await roundRes.json();
    // round = roundRs.round;

    // get round info from task state
    try {
      loading = true;
      const taskId = import.meta.env.VITE_TASK_ID;
      const taskState = await KoiiService.getTaskState(taskId);
      console.log("taskState", taskState);
      const epochInfo = await KoiiService.getEpochInfo();
      console.log("epochInfo", epochInfo);
      const currentRound = Math.floor(
        (epochInfo.absoluteSlot - taskState.starting_slot) /
          taskState.round_time
      );
      console.log("currentRound", currentRound);
      const nextRound = currentRound + 1;
      round = nextRound;

      // calculate startIn time
      const nextSlot =
        taskState.starting_slot + nextRound * taskState.round_time;
      // each slot is roughly equal to 408ms
      let startInMs = (nextSlot - epochInfo.absoluteSlot) * 408;
      roundStartTime = Date.now() + startInMs;

      // auto refresh page
      setTimeout(() => {
        location.reload();
      }, startInMs);

      loading = false;
    } catch (error) {
      loading = false;
      errorMsg =
        "Cannot fetch task metadata. Please refresh the page to try again!";
      round = 0;
    }

    // auto connect finnie wallet
    address = await KoiiService.connectWallet();

    // randomize riddle
    if (round > 0) {
      riddle = riddles[Math.floor(Math.random() * riddles.length)];
    }
  });
</script>

<main>
  <div>
    <div class="title">Koii Riddles Hunt</div>

    {#if loading}
      <div class="loading">
        <SyncLoader
          size="50"
          color="rgba(255, 255, 255, 0.87)"
          unit="px"
          duration="1s"
        />
      </div>
      <div>fetching task metadata...</div>
    {:else}
      <div class="sub-title">Round {round}</div>
      {#if roundStartTime > 0}
        <TimeCountdown startTime={roundStartTime} />
      {/if}
      {#if errorMsg}
        <div class="error">{errorMsg}</div>
      {/if}
    {/if}

    <div class="card">
      {#if riddle.question}
        <div class="question" in:fade={{ delay: 300 }}>
          <h2>{riddle.question}</h2>
        </div>
      {/if}

      <input size="50" bind:value={answer} placeholder="Enter your answer" />
      <input
        size="50"
        bind:value={address}
        placeholder="Enter your node wallet address"
      />
      <div>
        <button
          disabled={round == 0 || address == "" || answer == ""}
          on:click={submit}>Submit</button
        >
      </div>

      {#if proofCid != ""}
        <div class="proof" in:fade={{ delay: 300 }}>
          <p>Your proof CID:</p>
          <div>{proofCid}</div>
        </div>
      {/if}
    </div>
  </div>

  <Toaster />
</main>

<footer>
  Task ID: <a
    href="https://explorer.koii.live/address/{import.meta.env.VITE_TASK_ID}"
    target="_blank">{import.meta.env.VITE_TASK_ID}</a
  >
</footer>

<style>
  footer {
    position: fixed;
    left: 0;
    bottom: 1rem;
    width: 100%;
    text-align: center;
    font-size: small;
  }
  a {
    color: rgba(255, 255, 255, 0.87);
  }
  a:hover {
    text-decoration: underline;
  }

  .loading {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }
  .error {
    color: rgba(255, 0, 0, 0.75);
  }
  button {
    margin: 0 0.5rem 0 0.5rem;
  }
  .title {
    font-size: 3rem;
    line-height: 1;
  }
  .title:hover,
  button:hover {
    filter: drop-shadow(0 0 2em #ffffff);
  }
  .sub-title {
    font-size: 2rem;
  }
  .question {
    padding: 0 2rem 0 2rem;
  }
  .proof {
    margin: 1rem;
    font-size: x-large;
  }
</style>
