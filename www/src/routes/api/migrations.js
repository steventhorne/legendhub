const fs = require("fs");
const mysqlPool = require("./mysql-multi-connection");

let migrations = [];

exports.up = async function() {
    mysqlPool.getConnection(function(err, connection) {
        if (err) throw err;

        connection.query("SELECT table_name FROM information_schema.tables",
            [],
            function(error, results, _fields) {
                if (error) {
                    connection.release();
                    throw error;
                }

                if (!results.find((r) => r.table_name === "Migrations")) {
                    connection.query("CREATE TABLE Migrations (Id INT NOT NULL, Name VARCHAR(255) NOT NULL, RunOn DATE NOT NULL, PRIMARY KEY (id))",
                        [],
                        function(error, _results, _fields) {
                            if (error) {
                                connection.release();
                                throw error;
                            }
                            runMigrations(connection);
                        });
                }
                else {
                    runMigrations(connection);
                }
            });
    });
}

function runMigrations(connection) {
    connection.query("SELECT * FROM Migrations ORDER BY Id DESC",
        [],
        function(error, results, _fields) {
            if (error) {
                connection.release();
                throw error;
            }
            let latestMigrationId = 0;
            migrations = results;
            if (migrations.length > 0) {
                latestMigrationId = migrations[0].Id;
            }
            runMigration(connection, latestMigrationId + 1);
        });
}

function runMigration(connection, migrationId) {
    // extra fail safe to prevent migrations from running twice
    if (migrations.find(m => m.Id === migrationId)) runMigration(connection, migrationId + 1);

    let nextMigrationFile = `${__dirname}/migrations/${migrationId}.js`;
    if (fs.existsSync(nextMigrationFile)) {
        console.info(`Running migration '${nextMigrationFile}'...`);
        let migration = require(nextMigrationFile);

        connection.beginTransaction(function(err) {
            if (err) {
                connection.rollback(function() {
                    connection.release();
                });
            }
            else {
                connection.query(`
                    SET @DISABLE_NOTIFICATIONS = 1;
                    ${migration.up()}
                    SET @DISABLE_NOTIFICATIONS = NULL;
                `, [], function(err, _results, _fields) {
                    if (err) {
                        console.error(`Error running migration '${nextMigrationFile}': ${err}`);
                        connection.rollback(function() {
                            connection.release();
                        });
                    }
                    else {
                        connection.commit(function(err) {
                            if (err) {
                                console.error(`Error running migration '${nextMigrationFile}': ${err}`);
                                connection.rollback(function() {
                                    connection.release();
                                });
                            }
                            else {
                                connection.query("INSERT INTO Migrations (Id, Name, RunOn) VALUES (?, ?, ?)",
                                    [migrationId, nextMigrationFile, new Date()],
                                    function(err, _results, _fields) {
                                        if (err) {
                                            connection.rollback(function() {
                                                connection.release();
                                            });
                                        }
                                        else {
                                            runMigration(connection, migrationId + 1);
                                        }
                                    });
                            }
                        });
                    }
                });
            }
        });
    }
}
