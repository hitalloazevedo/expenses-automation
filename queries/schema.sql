CREATE TABLE transactions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    amount INT NOT NULL,
    date DATE NOT NULL
);

CREATE TABLE expenses (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    id_transaction INT UNIQUE,
    CONSTRAINT fk_expense_transaction
        FOREIGN KEY (id_transaction)
        REFERENCES transactions(id)
        ON DELETE CASCADE
);

CREATE TABLE expenses_categories (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(30) UNIQUE
);