import sqlite3

tconn = sqlite3.connect('tracker_data.db', check_same_thread=False)
tconn.row_factory = sqlite3.Row
tcsr = tconn.cursor()

def track_db_init():
	tcsr.execute('''CREATE TABLE IF NOT EXISTS trackers(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL,
	subject TEXT NOT NULL,
	attended INTEGER NOT NULL DEFAULT 0,
	total_days INTEGER NOT NULL DEFAULT 0
	)
	''')

def present(id):
	query = '''UPDATE trackers SET attended = attended + 1, total_days = total_days + 1 WHERE id = ?'''
	tcsr.execute(query, (id,))
	tconn.commit()

def absent(id):
	query = '''UPDATE trackers SET total_days = total_days + 1 WHERE id = ?'''
	tcsr.execute(query, (id,))
	tconn.commit()

def add_subject(uname, subject):
	query = '''INSERT INTO trackers (username, subject) VALUES (?,?)'''
	tcsr.execute(query, (uname, subject,))
	tconn.commit()

def delete_subject(id):
	query = 'DELETE FROM trackers WHERE id = ?'
	tcsr.execute(query, (id,))
	tconn.commit()

def fetch_subject(uname):
	query = 'SELECT id, subject, attended, total_days FROM trackers WHERE username = ?'
	return tcsr.execute(query, (uname,)).fetchall()

