CREATE TABLE books (
	id SERIAL PRIMARY KEY,
	title VARCHAR(100) NOT NULL,
	description VARCHAR,
	genre VARCHAR(50),
	isbn VARCHAR(20) NOT NULL
);

CREATE TABLE reviews (
	id SERIAL,
	note VARCHAR NOT NULL,
	rating INTEGER NOT NULL,
	created_on TIMESTAMP,
	book_id INTEGER REFERENCES books (id)
);