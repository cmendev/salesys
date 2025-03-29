use rusqlite::{params, Connection, Result};
use super::super::models::sale_detail::{SaleDetail, NewSaleDetail, SaleDetailWithProduct};

pub fn create_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sale_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL CHECK(quantity > 0),
            unit_price REAL NOT NULL CHECK(unit_price >= 0),
            subtotal REAL NOT NULL CHECK(subtotal >= 0),
            discount REAL DEFAULT 0 CHECK(discount >= 0),
            tax_amount REAL DEFAULT 0 CHECK(tax_amount >= 0),
            FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
        )",
        [],
    )?;
    Ok(())
}

pub fn create_sale_detail(conn: &Connection, detail: NewSaleDetail) -> Result<i32> {
    let subtotal = (detail.unit_price * detail.quantity as f64) - detail.discount;
    let tax_amount = subtotal * (detail.tax_percentage / 100.0);
    
    conn.execute(
        "INSERT INTO sale_details 
        (sale_id, product_id, quantity, unit_price, subtotal, discount, tax_amount) 
        VALUES (?, ?, ?, ?, ?, ?, ?)",
        params![
            detail.sale_id, 
            detail.product_id, 
            detail.quantity, 
            detail.unit_price,
            subtotal,
            detail.discount,
            tax_amount
        ],
    )?;
    
    // Actualizar stock del producto
    conn.execute(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        params![detail.quantity, detail.product_id],
    )?;
    
    Ok(conn.last_insert_rowid() as i32)
}

pub fn get_details_by_sale(conn: &Connection, sale_id: i32) -> Result<Vec<SaleDetail>> {
    let mut stmt = conn.prepare(
        "SELECT id, sale_id, product_id, quantity, unit_price, subtotal, discount, tax_amount 
        FROM sale_details WHERE sale_id = ?"
    )?;
    
    let details = stmt.query_map([sale_id], |row| {
        Ok(SaleDetail {
            id: row.get(0)?,
            sale_id: row.get(1)?,
            product_id: row.get(2)?,
            quantity: row.get(3)?,
            unit_price: row.get(4)?,
            subtotal: row.get(5)?,
            discount: row.get(6)?,
            tax_amount: row.get(7)?,
        })
    })?
    .collect::<Result<Vec<_>>>()?;
    
    Ok(details)
}

pub fn get_details_with_products_by_sale(
    conn: &Connection, 
    sale_id: i32
) -> Result<Vec<SaleDetailWithProduct>> {
    let mut stmt = conn.prepare(
        "SELECT 
            sd.id, 
            sd.sale_id, 
            sd.product_id, 
            p.name as product_name,
            p.code as product_code,
            sd.quantity, 
            sd.unit_price, 
            sd.subtotal, 
            sd.discount, 
            sd.tax_amount
        FROM sale_details sd
        JOIN products p ON sd.product_id = p.id
        WHERE sd.sale_id = ?"
    )?;
    
    let details = stmt.query_map([sale_id], |row| {
        Ok(SaleDetailWithProduct {
            id: row.get(0)?,
            sale_id: row.get(1)?,
            product_id: row.get(2)?,
            product_name: row.get(3)?,
            product_code: row.get(4)?,
            quantity: row.get(5)?,
            unit_price: row.get(6)?,
            subtotal: row.get(7)?,
            discount: row.get(8)?,
            tax_amount: row.get(9)?,
        })
    })?
    .collect::<Result<Vec<_>>>()?;
    
    Ok(details)
}

pub fn delete_sale_detail(conn: &Connection, id: i32) -> Result<()> {
    // Primero obtenemos el detalle para actualizar el stock
    let detail = conn.query_row(
        "SELECT product_id, quantity FROM sale_details WHERE id = ?",
        [id],
        |row| Ok((row.get::<_, i32>(0)?, row.get::<_, i32>(1)?))
    )?;
    
    // Eliminamos el detalle
    conn.execute("DELETE FROM sale_details WHERE id = ?", [id])?;
    
    // Revertimos el stock
    conn.execute(
        "UPDATE products SET stock = stock + ? WHERE id = ?",
        params![detail.1, detail.0],
    )?;
    
    Ok(())
}