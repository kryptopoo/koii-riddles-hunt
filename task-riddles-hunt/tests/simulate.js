const task = require('../task');

const run = async () => {
  let delay = 5000;
  let round = 2;
  console.log("Started a new task at round", round);

  setTimeout(async () => {
    console.log("Stopping task at round", round);
    let proof_cid = await task.submission.fetchSubmission(round - 1);
    console.log("Got round result", proof_cid);
    let output = await task.audit.validateNode(proof_cid, round);
    console.log("Validated round result", output);
  }, delay);
};
run();