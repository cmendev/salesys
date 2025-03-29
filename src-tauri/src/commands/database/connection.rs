use std::fs;
use tauri::{AppHandle, Manager};
use rusqlite::{Connection, Result};
use crate::commands::database::models::user::{NewUser, UserRole};
use crate::commands::database::queries::user_queries;

pub fn get_db_path(app_handle: &AppHandle) -> String {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("No se pudo obtener el directorio de datos");

    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir).expect("No se pudo crear el directorio de datos");
    }

    format!("{}/salesys.db", app_data_dir.display())
}

pub fn establish_connection(app_handle: &AppHandle) -> Result<Connection> {
    let conn = Connection::open(get_db_path(app_handle))?;
    Ok(conn)
}

pub fn initialize_database(app_handle: &AppHandle) -> Result<()> {
    let conn = establish_connection(app_handle)?;
    
    // Ejecutar todas las creaciones de tablas
    crate::commands::database::queries::product_queries::create_table(&conn)?;
    crate::commands::database::queries::customer_queries::create_table(&conn)?;
    crate::commands::database::queries::sale_queries::create_table(&conn)?;
    crate::commands::database::queries::sale_detail_queries::create_table(&conn)?;
    crate::commands::database::queries::invoice_queries::create_table(&conn)?;
    crate::commands::database::queries::user_queries::create_table(&conn)?;

    check_and_create_default_admin(&conn)?;
    
    Ok(())
}

fn check_and_create_default_admin(conn: &Connection) -> rusqlite::Result<()> {
    let user_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM users",
        [],
        |row| row.get(0)
    )?;

    if user_count == 0 {
        let default_admin = NewUser {
            username: "AdminSalesys".to_string(),
            email: "admin@salesys.com".to_string(),
            password: "admin".to_string(), // En producción usa un hash seguro
            role: UserRole::Admin,
            full_name: "Administrador Principal".to_string(),
        };
        
        user_queries::create_user(conn, default_admin)?;
        println!("Usuario administrador creado por defecto");
    }
    
    Ok(())
}
