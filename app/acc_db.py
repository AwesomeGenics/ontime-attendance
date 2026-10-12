import sqlite3

acc_conn = sqlite3.connect('tracker_data.db', check_same_thread=False)
acc_conn.row_factory = sqlite3.Row
acc_csr = acc_conn.cursor()

def acc_db_init():
    acc_csr.execute('''CREATE TABLE IF NOT EXISTS accounts(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    password TEXT NOT NULL
    )
    ''')

def create_acc(uname, email, passs):
    query = 'INSERT INTO accounts (username, email, password) VALUES (?,?,?)'
    acc_csr.execute(query, (uname, email, passs,))
    acc_conn.commit()

def login(uname):
    query = 'SELECT * FROM accounts WHERE username = ?'
    return acc_csr.execute(query, (uname,)).fetchone()

    