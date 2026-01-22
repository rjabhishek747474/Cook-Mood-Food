"""Show database users"""
import sqlite3
conn = sqlite3.connect('dailycook.db')
cursor = conn.cursor()
cursor.execute('SELECT id, email, is_active, is_verified, is_admin FROM users')
print('='*80)
print('DAILYCOOK DATABASE - USERS')
print('='*80)
print(f'{"ID":<5} {"EMAIL":<35} {"ACTIVE":<8} {"VERIFIED":<10} {"ADMIN"}')
print('-'*80)
for row in cursor.fetchall():
    print(f'{row[0]:<5} {row[1]:<35} {str(row[2]):<8} {str(row[3]):<10} {row[4]}')
print('='*80)
conn.close()
