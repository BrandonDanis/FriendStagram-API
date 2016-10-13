DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id                    SERIAL,
  name                  VARCHAR(35),
  username              VARCHAR(25)  NOT NULL UNIQUE,
  password              VARCHAR(100) NOT NULL,
  datecreated           TIMESTAMP    NOT NULL DEFAULT (NOW()),
  email                 VARCHAR(254) NOT NULL UNIQUE,
  description           VARCHAR(250),
  dailyLimit            INTEGER,
  profile_picture_id    INTEGER,
  profile_background_id INTEGER,
  verified              BOOLEAN      NOT NULL DEFAULT FALSE,
  UNIQUE (username, email),
  FOREIGN KEY (profile_picture_id) REFERENCES images (id),
  FOREIGN KEY (profile_background_id) REFERENCES images (id),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS images;
CREATE TABLE images (
  id        SERIAL,
  publicKey VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
  id          SERIAL,
  image_id    INTEGER,
  description VARCHAR(250),
  user_id     INTEGER,
  tag_id      INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (image_id) REFERENCES images (id),
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
