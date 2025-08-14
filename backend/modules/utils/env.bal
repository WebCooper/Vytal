import ballerina/os;

public function getEnv(string key, string defaultValue = "") returns string {
    string? value = os:getEnv(key);
    return value ?: defaultValue;
}

public function getEnvInt(string key, int defaultValue = 0) returns int {
    string? value = os:getEnv(key);
    if value is string {
        int|error intValue = int:fromString(value);
        return intValue is int ? intValue : defaultValue;
    }
    return defaultValue;
}

public function getEnvBool(string key, boolean defaultValue = false) returns boolean {
    string? value = os:getEnv(key);
    if value is string {
        return value.toLowerAscii() == "true";
    }
    return defaultValue;
}
