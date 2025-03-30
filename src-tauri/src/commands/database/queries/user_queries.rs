use bcrypt::{hash, verify};
use rusqlite::{params, Connection, Result};
use super::super::models::user::{User, NewUser, UserRole};

pub fn create_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'seller', 'manager')),
            full_name TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1
        )",
        [],
    )?;
    Ok(())
}

pub fn create_user(conn: &Connection, user: NewUser) -> Result<i32> {
    let password_hash = hash(&user.password, 12)
        .map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, rusqlite::types::Type::Text, Box::new(e)))?;
    
    conn.execute(
        "INSERT INTO users (username, email, password_hash, role, full_name) 
        VALUES (?, ?, ?, ?, ?)",
        params![
            user.username, 
            user.email, 
            password_hash, 
            user.role.to_string(), 
            user.full_name
        ],
    )?;
    Ok(conn.last_insert_rowid() as i32)
}

pub fn authenticate_user(
    conn: &Connection, 
    username: &str, 
    password: &str
) -> Result<Option<User>> {
    let mut stmt = conn.prepare(
        "SELECT id, username, email, password_hash, role, full_name, is_active 
        FROM users WHERE username = ?"
    )?;
    
    let mut rows = stmt.query_map([username], |row| {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            email: row.get(2)?,
            password_hash: row.get(3)?,
            role: UserRole::from(row.get::<_, String>(4)?.as_str()),
            full_name: row.get(5)?,
            is_active: row.get(6)?,
        })
    })?;
    
    if let Some(user) = rows.next() {
        let user = user?;
        if verify(password, &user.password_hash)
            .map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, rusqlite::types::Type::Text, Box::new(e)))?
        {
            Ok(Some(user))
        } else {
            Ok(None)
        }
    } else {
        Ok(None)
    }
}

pub fn update_user_password(
    conn: &Connection, 
    user_id: i32, 
    new_password: &str
) -> Result<()> {
    let password_hash = hash(new_password, 12)
        .map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, rusqlite::types::Type::Text, Box::new(e)))?;
    
    conn.execute(
        "UPDATE users SET password_hash = ? WHERE id = ?",
        params![password_hash, user_id],
    )?;
    Ok(())
}

pub fn deactivate_user(conn: &Connection, user_id: i32) -> Result<()> {
    conn.execute(
        "UPDATE users SET is_active = 0 WHERE id = ?",
        params![user_id],
    )?;
    Ok(())
}

pub fn get_user_by_id(conn: &Connection, user_id: i32) -> Result<Option<User>> {
    let mut stmt = conn.prepare(
        "SELECT id, username, email, password_hash, role, full_name, is_active 
        FROM users WHERE id = ?",
    )?;

    let mut rows = stmt.query_map(params![user_id], |row| {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            email: row.get(2)?,
            password_hash: row.get(3)?,
            role: UserRole::from(row.get::<_, String>(4)?.as_str()),
            full_name: row.get(5)?,
            is_active: row.get(6)?,
        })
    })?;

    if let Some(user) = rows.next() {
        Ok(Some(user?))
    } else {
        Ok(None)
    }
}

pub fn get_all_users(conn: &Connection) -> Result<Vec<User>> {
    let mut stmt = conn.prepare(
        "SELECT id, username, email, password_hash, role, full_name, is_active FROM users"
    )?;
    let users = stmt.query_map([], |row| {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            email: row.get(2)?,
            password_hash: row.get(3)?,
            role: UserRole::from(row.get::<_, String>(4)?.as_str()),
            full_name: row.get(5)?,
            is_active: row.get(6)?,
        })
    })?.collect();
    users
}

pub fn update_user(conn: &Connection, user: User) -> Result<()> {
    conn.execute(
        "UPDATE users SET username = ?, email = ?, role = ?, full_name = ?, is_active = ? WHERE id = ?",
        params![user.username, user.email, user.role.to_string(), user.full_name, user.is_active, user.id],
    )?;
    Ok(())
}

pub fn delete_user(conn: &Connection, user_id: i32) -> Result<usize, rusqlite::Error> {
    // Verificar primero si el usuario existe
    let exists: i32 = conn.query_row(
        "SELECT COUNT(*) FROM users WHERE id = ?",
        params![user_id],
        |row| row.get(0),
    )?;

    if exists == 0 {
        return Err(rusqlite::Error::QueryReturnedNoRows);
    }

    // Eliminar el usuario
    let rows_affected = conn.execute(
        "DELETE FROM users WHERE id = ?", 
        params![user_id]
    )?;
    
    println!("Usuario eliminado. Filas afectadas: {}", rows_affected);
    
    Ok(rows_affected)
}
