CREATE TABLE IF NOT EXISTS AccessTokens (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    AccessToken TEXT,
    UserId INTEGER,
    FOREIGN KEY(UserId) REFERENCES Users(Id)
);
