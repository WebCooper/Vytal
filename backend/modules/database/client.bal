import ballerinax/mysql;
import ballerinax/mysql.driver as _;
import backend.types;

# Database Client Configuration
configurable DatabaseConfig dbConfig = ?;

# MySQL client instance
final mysql:Client dbClient = check new (
    user = dbConfig.user,
    password = dbConfig.password,
    database = dbConfig.database,
    host = dbConfig.host,
    port = dbConfig.port
);

# Get the database client
public function getDbClient() returns mysql:Client {
    return dbClient;
}
