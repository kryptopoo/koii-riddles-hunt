const task = require('../task');

const run = async () => {
  let delay = 5000;
  let round = 2;
  console.log('Started a new task at round', round);

  setTimeout(async () => {
    const submission_value = await task.submission.submitTask(round);

    await task.audit.validateNode(submission_value, round);

    await task.distribution.submitDistributionList(round);

    await task.distribution.auditDistribution(round);
  }, delay);
};
run();
