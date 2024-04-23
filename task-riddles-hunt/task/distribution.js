const { namespaceWrapper } = require('../_koiiNode/koiiNode');
const { getJSONFromCID } = require('./common');

class Distribution {
  async submitDistributionList(round) {
    // This function just upload your generated dustribution List and do the transaction for that

    console.log(`ROUND_${round}_submitDistributionList`);

    try {
      const distributionList = await this.generateDistributionList(round);

      const decider = await namespaceWrapper.uploadDistributionList(distributionList, round);
      console.log(`ROUND_${round}_submitDistributionList`, 'DECIDER', decider);

      if (decider) {
        const response = await namespaceWrapper.distributionListSubmissionOnChain(round);
        console.log('RESPONSE FROM DISTRIBUTION LIST', response);
      }
    } catch (err) {
      console.log('ERROR IN SUBMIT DISTRIBUTION', err);
    }
  }

  async auditDistribution(roundNumber) {
    console.log(`ROUND_${roundNumber}_auditDistribution`);
    await namespaceWrapper.validateAndVoteOnDistributionList(this.validateDistribution, roundNumber);
  }

  async generateDistributionList(round, _dummyTaskState) {
    try {
      console.log(`ROUND_${round}_generateDistributionList`);
      // console.log('I am selected node');

      // Write the logic to generate the distribution list here by introducing the rules of your choice

      /*  **** SAMPLE LOGIC FOR GENERATING DISTRIBUTION LIST ******/

      let distributionList = {};
      let distributionCandidates = [];
      let taskAccountDataJSON = await namespaceWrapper.getTaskState();
      if (taskAccountDataJSON == null) taskAccountDataJSON = _dummyTaskState;
      const submissions = taskAccountDataJSON.submissions[round];
      const submissions_audit_trigger = taskAccountDataJSON.submissions_audit_trigger[round];
      if (submissions == null) {
        console.log(`No submisssions found in round ${round}`);
        return distributionList;
      } else {
        const keys = Object.keys(submissions);
        const values = Object.values(submissions);
        const size = values.length;
        console.log('Submissions from last round: ', keys, values, size);

        // Logic for slashing the stake of the candidate who has been audited and found to be false
        for (let i = 0; i < size; i++) {
          const candidatePublicKey = keys[i];
          const lastSubmissionValue = values[i].submission_value;
          if (submissions_audit_trigger && submissions_audit_trigger[candidatePublicKey]) {
            console.log('distributions_audit_trigger votes ', submissions_audit_trigger[candidatePublicKey].votes);
            const votes = submissions_audit_trigger[candidatePublicKey].votes;
            if (votes.length === 0) {
              // slash 70% of the stake as still the audit is triggered but no votes are casted
              // Note that the votes are on the basis of the submission value
              // to do so we need to fetch the stakes of the candidate from the task state
              const stake_list = taskAccountDataJSON.stake_list;
              const candidateStake = stake_list[candidatePublicKey];
              const slashedStake = candidateStake * 0.7;
              distributionList[candidatePublicKey] = -slashedStake;
              console.log('Candidate Stake', candidateStake);
            } else {
              let numOfVotes = 0;
              for (let index = 0; index < votes.length; index++) {
                if (votes[index].is_valid) numOfVotes++;
                else numOfVotes--;
              }

              if (numOfVotes < 0) {
                // slash 70% of the stake as the number of false votes are more than the number of true votes
                // Note that the votes are on the basis of the submission value
                // to do so we need to fetch the stakes of the candidate from the task state
                const stake_list = taskAccountDataJSON.stake_list;
                const candidateStake = stake_list[candidatePublicKey];
                const slashedStake = candidateStake * 0.7;
                distributionList[candidatePublicKey] = -slashedStake;
                console.log('Candidate Stake', candidateStake);
              }

              if (numOfVotes > 0) {
                distributionCandidates.push(candidatePublicKey);
              }
            }
          } else {
            // validate winner in last round
            const isWinner = await this.validateWinner(round, lastSubmissionValue);
            if (isWinner) distributionCandidates.push(candidatePublicKey);
          }
        }
      }

      // now distribute the rewards based on the valid submissions
      // Here it is assumed that all the nodes doing valid submission gets the same reward

      const reward =
        distributionCandidates.length > 0
          ? Math.floor(taskAccountDataJSON.bounty_amount_per_round / distributionCandidates.length)
          : 0;
      console.log('REWARD RECEIVED BY EACH NODE', reward);
      for (let i = 0; i < distributionCandidates.length; i++) {
        distributionList[distributionCandidates[i]] = reward;
      }
      console.log('Distribution List', distributionList);
      return distributionList;
    } catch (err) {
      console.log('ERROR IN GENERATING DISTRIBUTION LIST', err);
    }
  }

  validateDistribution = async (distributionListSubmitter, round, _dummyDistributionList, _dummyTaskState) => {
    // Write your logic for the validation of submission value here and return a boolean value in response
    // this logic can be same as generation of distribution list function and based on the comparision will final object , decision can be made

    try {
      // console.log('Distribution list Submitter', distributionListSubmitter);
      const rawDistributionList = await namespaceWrapper.getDistributionList(distributionListSubmitter, round);
      let fetchedDistributionList;
      if (rawDistributionList == null) {
        fetchedDistributionList = _dummyDistributionList;
      } else {
        fetchedDistributionList = JSON.parse(rawDistributionList);
      }
      console.log('FETCHED DISTRIBUTION LIST', fetchedDistributionList);
      const generateDistributionList = await this.generateDistributionList(round, _dummyTaskState);

      // compare distribution list

      const parsed = fetchedDistributionList;
      console.log('compare distribution list', parsed, generateDistributionList);
      const result = await this.shallowEqual(parsed, generateDistributionList);
      console.log('RESULT', result);
      return result;
    } catch (err) {
      console.log('ERROR IN VALIDATING DISTRIBUTION', err);
      return false;
    }
  };

  async shallowEqual(parsed, generateDistributionList) {
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }

    // Normalize key quote usage for generateDistributionList
    generateDistributionList = JSON.parse(JSON.stringify(generateDistributionList));

    const keys1 = Object.keys(parsed);
    const keys2 = Object.keys(generateDistributionList);
    if (keys1.length !== keys2.length) {
      return false;
    }

    for (let key of keys1) {
      if (parsed[key] !== generateDistributionList[key]) {
        return false;
      }
    }
    return true;
  }

  async validateWinner(round, proofCid) {
    let isValid = false;

    // validate winner of last round
    const lastRound = round - 1;

    try {
      // get submitter/main address
      const submitterAccountKeyPair = (await namespaceWrapper.getSubmitterAccount()).publicKey;
      const submitterAddress = submitterAccountKeyPair.toBase58();
      const mainAccountAddress = namespaceWrapper.getMainAccountPubkey();
      console.log(`ROUND_${round}_validateWinner`, 'submitterAddress', submitterAddress);
      console.log(`ROUND_${round}_validateWinner`, 'mainAccountAddress', mainAccountAddress);

      const proofData = await getJSONFromCID(proofCid, 'data.json');
      console.log(`ROUND_${round}_validateWinner`, `proofData`, proofData);

      // TODO: the condition should be updated
      if (
        proofData.round == lastRound &&
        (proofData.address.toLowerCase() == submitterAddress.toLowerCase() ||
          proofData.address.toLowerCase() == mainAccountAddress.toLowerCase())
      ) {
        isValid = proofData.correct_answer == proofData.answer;
      }
      console.log(`ROUND_${round}_validateWinner`, `isValid`, isValid);
    } catch (e) {
      console.error(e);
      isValid = false;
    }

    return isValid;
  }
}

const distribution = new Distribution();
module.exports = {
  distribution,
};
