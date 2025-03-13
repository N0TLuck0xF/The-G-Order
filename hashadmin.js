const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("database.db");

const username = "shaneegorder";
const password = "AI0Jb7Uqz83meqxC";

bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }

    db.run(
        "UPDATE users SET password = ? WHERE username = ?",
        [hashedPassword, username],
        function (err) {
            if (err) {
                console.error("Error updating password:", err);
            } else {
                console.log("✅ Admin password updated successfully!");
            }
            db.close();
        }
    );
});
