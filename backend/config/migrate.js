const db = require("./db");

function migrate() {
  return new Promise((resolve, reject) => {
    console.log("🔄 Running database migrations...");

    // Describe reminders table to see existing fields
    db.query("DESCRIBE reminders", (err, fields) => {
      if (err) {
        console.error("❌ Migration error: Failed to describe table", err);
        return reject(err);
      }

      const columnNames = fields.map(f => f.Field);
      const alterQueries = [];

      // Check if 'status' column exists
      if (!columnNames.includes("status")) {
        console.log("➕ Queuing status column addition...");
        alterQueries.push(
          "ALTER TABLE reminders ADD COLUMN status ENUM('PENDING', 'TRIGGERED', 'MISSED') DEFAULT 'PENDING'"
        );
      }

      // Check if 'repeat_type' column exists
      if (!columnNames.includes("repeat_type")) {
        console.log("➕ Queuing repeat_type column addition...");
        alterQueries.push(
          "ALTER TABLE reminders ADD COLUMN repeat_type ENUM('NONE', 'DAILY', 'WEEKLY', 'MONTHLY') DEFAULT 'NONE'"
        );
      }

      // Check if 'category' column exists
      if (!columnNames.includes("category")) {
        console.log("➕ Queuing category column addition...");
        alterQueries.push(
          "ALTER TABLE reminders ADD COLUMN category VARCHAR(50) DEFAULT 'Other'"
        );
      }

      if (alterQueries.length === 0) {
        console.log("✅ Database schema is up to date.");
        return resolve();
      }

      // Execute queued alter queries sequentially
      let promiseChain = Promise.resolve();
      alterQueries.forEach(query => {
        promiseChain = promiseChain.then(() => {
          return new Promise((res, rej) => {
            db.query(query, (alterErr) => {
              if (alterErr) {
                console.error(`❌ Alter query failed: "${query}"`, alterErr);
                rej(alterErr);
              } else {
                console.log(`✅ Alter query completed successfully`);
                res();
              }
            });
          });
        });
      });

      promiseChain
        .then(() => {
          console.log("🎉 Migration finished successfully!");
          resolve();
        })
        .catch(migrateErr => reject(migrateErr));
    });
  });
}

module.exports = migrate;
