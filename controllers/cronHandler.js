const User = require("../models/userModel");

const handleCron = async () => {
  try {
    const oneday = new Date() - 60 * 60 * 24 * 1000;
    const condition = { cron: { $lte: oneday } };

    const update = [
      {
        $set: {
          cron: new Date(),
        },
      },
      {
        $set: {
          requireMfa: false,
        },
      },
      
    ];

  


    const option = { multi: true };
    await User.updateMany(condition, update, option);
  } catch (e) {
    console.log(e);
  }
};

module.exports = handleCron;
