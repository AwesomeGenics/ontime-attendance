from flask import (render_template, Flask, redirect, url_for, session, flash, Blueprint, request, send_from_directory, current_app)
from app.track_db import fetch_subject, add_subject, absent, present, delete_subject

tracker = Blueprint('tracker', __name__)

@tracker.route('/manifest.json')
def manifest():
    return send_from_directory(current_app.static_folder, 'manifest.json', mimetype='application/manifest+json')

@tracker.route('/sw.js')
def service_worker():
    response = send_from_directory(current_app.static_folder, 'sw.js', mimetype='application/javascript')
    response.headers['Service-Worker-Allowed'] = '/'
    response.headers['Cache-Control'] = 'no-cache'
    return response

@tracker.route('/')
def root():
    if session.get('uname'):
        return redirect('/home')
    return redirect('/login')

@tracker.route('/home')
def home():
    if session.get('uname'):
        subjects = fetch_subject(session.get('uname'))
        msg = None
        if not subjects:
            msg = 'No Subject Added Yet'
        return render_template('home.html', data = subjects, msg = msg)
    return redirect('/login_msg')

@tracker.route('/add', methods=['GET','POST'])
def add():
    if session.get('uname'):
        sub_name = request.form.get('subject', '').strip()
        if sub_name:
            try:
                add_subject(session['uname'], sub_name)
            except Exception:
                flash(f'Subject "{sub_name}" already exists or could not be added')
        return redirect('/home')
    return redirect('/login_msg')

@tracker.route('/del/<int:num>')
def delete(num):
    if session.get('uname'):
        delete_subject(num)
        return redirect('/home')
    return redirect('/login_msg')

@tracker.route('/login_msg')
def login_msg():
    flash('Login to access this page')
    return redirect('/login')

@tracker.route('/atnd/<int:iden>')
def attended(iden):
    if not session.get('uname'):
        return redirect('/login_msg')
    present(iden)
    return redirect('/home')

@tracker.route('/absnt/<int:iden>')
def mark_absent(iden):
    if not session.get('uname'):
        return redirect('/login_msg')
    absent(iden)
    return redirect('/home')
