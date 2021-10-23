DROP TABLE app_user;
CREATE TABLE app_user (
id SERIAL PRIMARY KEY,
google_id TEXT,
account TEXT,
name TEXT,
picture TEXT,
notification BOOLEAN DEFAULT false,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT app_user_google_id UNIQUE(google_id)
);
ALTER TABLE app_user ADD COLUMN notification BOOLEAN DEFAULT false;

DROP TABLE post;
CREATE TABLE post (
 id SERIAL PRIMARY KEY,
 user_id INTEGER REFERENCES app_user(id) ON DELETE CASCADE,
 source TEXT,
 likes INTEGER,
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX post_user_id ON post(user_id);
ALTER TABLE post ADD COLUMN likes INTEGER DEFAULT 0;

DROP TABLE comment;
CREATE TABLE comment (
 id SERIAL PRIMARY KEY,
 post_id INTEGER REFERENCES post(id) ON DELETE CASCADE,
 user_id INTEGER REFERENCES app_user(id) ON DELETE CASCADE,
 source TEXT,
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX comment_post_id ON comment(post_id);

DROP TABLE follow;
CREATE TABLE follow (
 user_id INTEGER REFERENCES app_user(id) ON DELETE CASCADE,
 following_user_id INTEGER,
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (user_id, following_user_id)
);

CREATE TYPE notification_type AS ENUM ('follow', 'like', 'comment');

DROP TABLE notification;
CREATE TABLE notification (
 id SERIAL PRIMARY KEY,
 user_id INTEGER REFERENCES app_user(id) ON DELETE CASCADE,
 type notification_type,
 action_user_id INTEGER REFERENCES app_user(id) ON DELETE CASCADE,
 post_id INTEGER REFERENCES post(id) ON DELETE CASCADE,
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX notification_user_id ON notification(user_id);
ALTER TABLE notification ADD COLUMN type notification_type;

DROP TABLE likes;
CREATE TABLE likes (
 user_id INTEGER REFERENCES app_user(id) ON DELETE CASCADE,
 post_id INTEGER REFERENCES post(id) ON DELETE CASCADE,
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (user_id, post_id)
);

