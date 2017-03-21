DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id                        SERIAL,
  name                      VARCHAR(35),
  username                  VARCHAR(25)  NOT NULL UNIQUE,
  password                  VARCHAR(100) NOT NULL,
  datecreated               TIMESTAMP    NOT NULL DEFAULT (NOW()),
  email                     VARCHAR(254) NOT NULL UNIQUE,
  description               VARCHAR(250),
  dailyLimit                INTEGER,
  profile_picture_url       VARCHAR(250),
  profile_background_url    VARCHAR(250),
  verified                  BOOLEAN      NOT NULL DEFAULT FALSE,
  UNIQUE (username, email),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
  id          SERIAL,
  description VARCHAR(250),
  user_id     INTEGER,
  tag_id      INTEGER,
  image_url   VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (tag_id) REFERENCES tags (id),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS post_likes;
CREATE TABLE post_likes (
  id      SERIAL,
  post_id INTEGER,
  user_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (post_id) REFERENCES posts (id),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS tags;
CREATE TABLE tags (
  id   SERIAL,
  name VARCHAR,
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS post_tags;
CREATE TABLE post_tags (
  id      SERIAL,
  post_id INTEGER,
  tag_id  INTEGER,
  FOREIGN KEY (post_id) REFERENCES posts (id),
  FOREIGN KEY (tag_id) REFERENCES tags (id),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS users_sessions;
CREATE TABLE users_sessions (
    id UUID NOT NULL,
    user_id INTEGER NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (id, user_id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);