use rusqlite::{params, Connection, Result};
use super::super::models::invoice::{Invoice, NewInvoice};
use chrono::NaiveDateTime;

pub fn create_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id INTEGER NOT NULL,
            uuid TEXT UNIQUE NOT NULL,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            file_path TEXT NOT NULL,
            status TEXT DEFAULT 'active' CHECK(status IN ('active', 'canceled')),
            FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
        )",
        [],
    )?;
    Ok(())
}

pub fn create_invoice(conn: &Connection, invoice: NewInvoice) -> Result<i32> {
    conn.execute(
        "INSERT INTO invoices (sale_id, uuid, file_path, status) 
        VALUES (?, ?, ?, ?)",
        params![
            invoice.sale_id, 
            invoice.uuid, 
            invoice.file_path, 
            invoice.status.unwrap_or("active".to_string())
        ],
    )?;
    Ok(conn.last_insert_rowid() as i32)
}

pub fn get_invoice_by_uuid(conn: &Connection, uuid: &str) -> Result<Invoice> {
    conn.query_row(
        "SELECT id, sale_id, uuid, date, file_path, status FROM invoices WHERE uuid = ?",
        [uuid],
        |row| {
            let date_str: String = row.get(3)?;
            Ok(Invoice {
                id: row.get(0)?,
                sale_id: row.get(1)?,
                uuid: row.get(2)?,
                date: NaiveDateTime::parse_from_str(&date_str, "%Y-%m-%d %H:%M:%S")
                    .map_err(|e| rusqlite::Error::FromSqlConversionFailure(3, rusqlite::types::Type::Text, Box::new(e)))?,
                file_path: row.get(4)?,
                status: row.get(5)?,
            })
        },
    )
}

pub fn get_invoices_by_sale(conn: &Connection, sale_id: i32) -> Result<Vec<Invoice>> {
    let mut stmt = conn.prepare(
        "SELECT id, sale_id, uuid, date, file_path, status 
        FROM invoices WHERE sale_id = ?"
    )?;
    
    let invoices = stmt.query_map([sale_id], |row| {
        let date_str: String = row.get(3)?;
        Ok(Invoice {
            id: row.get(0)?,
            sale_id: row.get(1)?,
            uuid: row.get(2)?,
            date: NaiveDateTime::parse_from_str(&date_str, "%Y-%m-%d %H:%M:%S")
                .map_err(|e| rusqlite::Error::FromSqlConversionFailure(3, rusqlite::types::Type::Text, Box::new(e)))?,
            file_path: row.get(4)?,
            status: row.get(5)?,
        })
    })?
    .collect::<Result<Vec<_>>>()?;
    
    Ok(invoices)
}

pub fn cancel_invoice(conn: &Connection, uuid: &str) -> Result<()> {
    conn.execute(
        "UPDATE invoices SET status = 'canceled' WHERE uuid = ?",
        [uuid],
    )?;
    Ok(())
}
