const cron = require("node-cron");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV || "local"}` });

cron.schedule("* * * * *", (arg) => {
  if (arg === "init" || arg === "manual") date = new Date();
  else date = arg;

  try {
    console.log(`Running scheduled apps for ${date.toISOString()}`);

    fetch(
      `http://localhost:${
        process.env.PORT || 3000
      }/api/scheduler?date=${encodeURIComponent(date.toISOString())}&key=${
        process.env.SCHEDULER_KEY
      }`,
    );
  } catch (e) {
    console.error(e);
  }
});
