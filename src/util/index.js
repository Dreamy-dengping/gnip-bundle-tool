const chalk = require("chalk");
const spinners = require("cli-spinners");
const ora = require("ora");
const moment = require("moment"); // require

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

function generateDurationTime(fromTime, endTime) {
  const fromTimeFormat = moment(fromTime);
  const endTimeFormat = moment(endTime);
  const duration = endTimeFormat.diff(fromTimeFormat, "minutes", true);
  if (duration <= 1) {
    return (
      "打包共计耗时" + endTimeFormat.diff(fromTimeFormat, "seconds") + "秒"
    );
  } else {
    return "打包共计耗时" + duration.toFixed(2) + "分钟";
  }
}

module.exports = {
  logError,
  logSuccess,
  logInfo,
  spinner,
  generateDurationTime,
};
