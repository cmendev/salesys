use rusqlite::{params, Connection, Result};
use super::super::models::customer::{Customer, NewCustomer};

pub fn create_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT,
            address TEXT,
            rfc TEXT
        )",
        [],
    )?;
    Ok(())
}

pub fn create_customer(conn: &Connection, customer: NewCustomer) -> Result<i32> {
    conn.execute(
        "INSERT INTO customers (name, email, phone, address, rfc) 
        VALUES (?, ?, ?, ?, ?)",
        params![customer.name, customer.email, customer.phone, 
               customer.address, customer.rfc],
    )?;
    Ok(conn.last_insert_rowid() as i32)
}

pub fn get_customer(conn: &Connection, id: i32) -> Result<Customer> {
    conn.query_row(
        "SELECT id, name, email, phone, address, rfc FROM customers WHERE id = ?",
        [id],
        |row| {
            Ok(Customer {
                id: row.get(0)?,
                name: row.get(1)?,
                email: row.get(2)?,
                phone: row.get(3)?,
                address: row.get(4)?,
                rfc: row.get(5)?,
            })
        },
    )
}

pub fn get_all_customers(conn: &Connection) -> Result<Vec<Customer>> {
    let mut stmt = conn.prepare("SELECT id, name, email, phone, address, rfc FROM customers")?;
    let customers = stmt.query_map([], |row| {
        Ok(Customer {
            id: row.get(0)?,
            name: row.get(1)?,
            email: row.get(2)?,
            phone: row.get(3)?,
            address: row.get(4)?,
            rfc: row.get(5)?,
        })
    })?
    .collect::<Result<Vec<_>>>()?;
    Ok(customers)
}

pub fn update_customer(conn: &Connection, id: i32, customer: NewCustomer) -> Result<()> {
    conn.execute(
        "UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, rfc = ? 
        WHERE id = ?",
        params![customer.name, customer.email, customer.phone, 
               customer.address, customer.rfc, id],
    )?;
    Ok(())
}

pub fn delete_customer(conn: &Connection, id: i32) -> Result<()> {
    conn.execute("DELETE FROM customers WHERE id = ?", [id])?;
    Ok(())
}