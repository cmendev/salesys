use rusqlite::{params, Connection, Result};
use super::super::models::product::{Product, NewProduct};

pub fn create_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL
        )",
        [],
    )?;
    Ok(())
}

pub fn create_product(conn: &Connection, product: NewProduct) -> Result<i32> {
    conn.execute(
        "INSERT INTO products (name, code, price, stock) VALUES (?, ?, ?, ?)",
        params![product.name, product.code, product.price, product.stock],
    )?;
    Ok(conn.last_insert_rowid() as i32)
}

pub fn get_product(conn: &Connection, id: i32) -> Result<Product> {
    conn.query_row(
        "SELECT id, name, code, price, stock FROM products WHERE id = ?",
        [id],
        |row| {
            Ok(Product {
                id: row.get(0)?,
                name: row.get(1)?,
                code: row.get(2)?,
                price: row.get(3)?,
                stock: row.get(4)?,
            })
        },
    )
}

pub fn get_all_products(conn: &Connection) -> Result<Vec<Product>> {
    let mut stmt = conn.prepare("SELECT id, name, code, price, stock FROM products")?;
    let products = stmt.query_map([], |row| {
        Ok(Product {
            id: row.get(0)?,
            name: row.get(1)?,
            code: row.get(2)?,
            price: row.get(3)?,
            stock: row.get(4)?,
        })
    })?
    .collect::<Result<Vec<_>>>()?;
    Ok(products)
}

pub fn update_product(conn: &Connection, id: i32, product: NewProduct) -> Result<()> {
    conn.execute(
        "UPDATE products SET name = ?, code = ?, price = ?, stock = ? WHERE id = ?",
        params![product.name, product.code, product.price, product.stock, id],
    )?;
    Ok(())
}

pub fn delete_product(conn: &Connection, id: i32) -> Result<()> {
    conn.execute("DELETE FROM products WHERE id = ?", [id])?;
    Ok(())
}