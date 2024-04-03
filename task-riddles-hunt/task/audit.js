const { namespaceWrapper } = require('../_koiiNode/koiiNode');
const { getJSONFromCID } = require('./common');

class Audit {
  async validateNode(submission_value, round) {
    // Write your logic for the validation of submission value here and return a boolean value in response

    // The sample logic can be something like mentioned below to validate the submission
    let vote = true;
    console.log('SUBMISSION VALUE', submission_value, round);
    try {
      // check result from proofCID
      const proofCid = submission_value;
      const proofData = await getJSONFromCID(proofCid, 'data.json'); // check this
      if (proofData.round == round) {
        vote = proofData.correct_answer == proofData.answer;

        // // TODO: check submitter address
        // const submitterAccountKeyPair = (
        //   await namespaceWrapper.getSubmitterAccount()
        // ).publicKey;
        // const key = submitterAccountKeyPair.toBase58();
        // console.log('submitter key', key);
      }

      console.log('SUBMISSION proofData', proofData);
    } catch (e) {
      console.error(e);
      vote = false;
    }
    return vote;
  }

  async auditTask(roundNumber) {
    console.log('auditTask called with round', roundNumber);
    console.log(
      await namespaceWrapper.getSlot(),
      'current slot while calling auditTask',
    );
    await namespaceWrapper.validateAndVoteOnNodes(
      this.validateNode,
      roundNumber,
    );
  }
}
const audit = new Audit();
module.exports = { audit };
