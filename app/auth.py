from flask import (render_template, Flask, redirect, url_for, session, flash, Blueprint, request)
from app.acc_db import create_acc, login
from werkzeug.security import generate_password_hash, check_password_hash

auth = Blueprint('auth', __name__)


@auth.route('/login', methods=['GET', 'POST'])
def user_login():
    if request.method == 'POST':
        uname = request.form.get('username')
        pwd = request.form.get('password')
        a = login(uname)
        if a and a['password'] and a['username']:
            if pwd and uname and check_password_hash(a['password'], pwd):
                session.permanent = True
                session['uname'] = uname
                return redirect(url_for('tracker.home', name = session.get('uname')))
            elif pwd and uname:
                flash('Wrong credentials entered')
                return redirect('/login')
            else:
                flash('No field can be left empty')
                return redirect('/login')
        else:
            flash('No such account exits. Create one.')
            return redirect('/login')
    un = request.args.get('un', '')
    return render_template('login.html', un=un)


@auth.route('/register', methods=['GET','POST'])
def register():
    if request.method == 'POST':
        uname = request.form.get('username')
        email = request.form.get('email')
        pwd = request.form.get('password')
        cnfpwd = request.form.get('cnf-password')

        if pwd != cnfpwd:
            flash('Passwords do not match')
            return redirect('/register')

        if login(uname):
            flash('Account already exists.')
            return redirect('/register')

        pwd = generate_password_hash(pwd)
        create_acc(uname, email, pwd)
        return redirect(url_for('auth.user_login', un=uname))

    return render_template('register.html')

@auth.route('/logout')
def logout():
    session.clear()
    return redirect('/login')