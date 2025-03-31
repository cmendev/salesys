use rusqlite::{Connection, params, Result};
use chrono::NaiveDateTime;
use super::super::models::sale::{Sale, NewSale};

pub fn create_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            customer_id INTEGER,
            subtotal REAL NOT NULL,
            taxes REAL NOT NULL,
            total REAL NOT NULL,
            payment_method TEXT CHECK(payment_method IN ('cash', 'credit', 'debit', 'transfer')),
            status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'canceled', 'refunded')),
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
        )",
        [],
    )?;
    Ok(())
}

pub fn create_sale(conn: &Connection, sale: NewSale) -> Result<i32> {
    conn.execute(
        "INSERT INTO sales (customer_id, subtotal, taxes, total, payment_method, status) 
        VALUES (?, ?, ?, ?, ?, ?)",
        params![
            sale.customer_id, 
            sale.subtotal, 
            sale.taxes, 
            sale.total, 
            sale.payment_method, 
            sale.status.unwrap_or_else(|| "completed".to_string())
        ],
    )?;
    Ok(conn.last_insert_rowid() as i32)
}

pub fn get_sale(conn: &Connection, id: i32) -> Result<Sale> {
    conn.query_row(
        "SELECT id, date, customer_id, subtotal, taxes, total, payment_method, status 
        FROM sales WHERE id = ?",
        [id],
        |row| {
            let date_str: String = row.get(1)?;
            let date = NaiveDateTime::parse_from_str(&date_str, "%Y-%m-%d %H:%M:%S")
                .map_err(|e| rusqlite::Error::FromSqlConversionFailure(
                    1, 
                    rusqlite::types::Type::Text, 
                    Box::new(e)
                ))?;
            
            Ok(Sale {
                id: row.get(0)?,
                date,
                customer_id: row.get(2)?,
                subtotal: row.get(3)?,
                taxes: row.get(4)?,
                total: row.get(5)?,
                payment_method: row.get(6)?,
                status: row.get(7)?,
            })
        },
    )
}

pub fn get_sales_by_date_range(
    conn: &Connection, 
    start: NaiveDateTime, 
    end: NaiveDateTime
) -> Result<Vec<Sale>> {
    let mut stmt = conn.prepare(
        "SELECT id, date, customer_id, subtotal, taxes, total, payment_method, status 
        FROM sales 
        WHERE date BETWEEN ? AND ?
        ORDER BY date DESC"
    )?;
    
    // Formateamos las fechas para SQLite
    let start_str = start.format("%Y-%m-%d %H:%M:%S").to_string();
    let end_str = end.format("%Y-%m-%d %H:%M:%S").to_string();
    
    let sales = stmt.query_map(
        params![start_str, end_str],
        |row| {
            let date_str: String = row.get(1)?;
            
            // Parseamos la fecha con manejo de errores
            let date = NaiveDateTime::parse_from_str(&date_str, "%Y-%m-%d %H:%M:%S")
                .map_err(|e| rusqlite::Error::FromSqlConversionFailure(
                    1, 
                    rusqlite::types::Type::Text, 
                    Box::new(e)
                ))?;
            
            Ok(Sale {
                id: row.get(0)?,
                date,
                customer_id: row.get(2)?,
                subtotal: row.get(3)?,
                taxes: row.get(4)?,
                total: row.get(5)?,
                payment_method: row.get(6)?,
                status: row.get(7)?,
            })
        }
    )?
    .collect::<Result<Vec<_>>>()?;
    
    Ok(sales)
}

pub fn cancel_sale(conn: &Connection, id: i32) -> Result<()> {
    conn.execute(
        "UPDATE sales SET status = 'canceled' WHERE id = ?",
        [id],
    )?;
    Ok(())
}