const chalk = require("chalk");
const spinners = require("cli-spinners");
const ora = require("ora");
const spinner = ora({
  // text: "bundling...",
  spinner: spinners.line,
});
function logError(message) {
  return console.log(chalk.red(message));
}
function logSuccess(message) {
  return console.log(chalk.green(message));
}
function logInfo(message) {
  return console.log(chalk.blue(message));
}
module.exports = {
  logError,
  logSuccess,
  logInfo,
  spinner,
};
