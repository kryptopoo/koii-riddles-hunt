const { namespaceWrapper } = require('../_koiiNode/koiiNode');
const dotenv = require('dotenv');
dotenv.config();

class Submission {
  async task(round) {
    // Write the logic to do the work required for submitting the values and optionally store the result in levelDB

    // Below is just a sample of work that a task can do
    const proofCid = process.env.PROOF_CID;

    try {
      const value = proofCid;
      console.log(`ROUND_${round}_task`, 'ROUND', round);

      if (value) {
        // store value on NeDB
        await namespaceWrapper.storeSet('value', value);
      }
      return value;
    } catch (err) {
      console.log('ERROR IN EXECUTING TASK', err);
      return 'ERROR IN EXECUTING TASK' + err;
    }
  }

  async submitTask(roundNumber) {
    console.log(`ROUND_${roundNumber}_submitTask`);
    try {
      // console.log('inside try');
      // console.log(await namespaceWrapper.getSlot(), 'current slot while calling submit');
      const submission = await this.fetchSubmission(roundNumber);
      console.log(`ROUND_${roundNumber}_submitTask`, 'fetchSubmission', submission);
      await namespaceWrapper.checkSubmissionAndUpdateRound(submission, roundNumber);
      // console.log('after the submission call');
      return submission;
    } catch (error) {
      console.log('error in submission', error);
    }
  }

  async fetchSubmission(round) {
    // Write the logic to fetch the submission values here and return the cid string

    // fetching round number to store work accordingly

    console.log(`ROUND_${round}_fetchSubmission`);

    // The code below shows how you can fetch your stored value from level DB

    const value = await namespaceWrapper.storeGet('value'); // retrieves the value
    // console.log('VALUE', value);
    return value;
  }
}
const submission = new Submission();
module.exports = { submission };
