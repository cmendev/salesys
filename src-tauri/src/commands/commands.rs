use chrono::NaiveDateTime;
use tauri::AppHandle;
use crate::commands::database::{
    connection::establish_connection,
    models::{
        product::{Product, NewProduct},
        customer::{Customer, NewCustomer},
        sale::{Sale, NewSale},
        sale_detail::{SaleDetail, NewSaleDetail, SaleDetailWithProduct},
        invoice::{Invoice, NewInvoice},
        user::{User, NewUser},
    },
    queries::{
        product_queries,
        customer_queries,
        sale_queries,
        sale_detail_queries,
        invoice_queries,
        user_queries
    }
};

/* ========== PRODUCTOS ========== */
#[tauri::command]
pub async fn add_product(
    app_handle: AppHandle,
    product: NewProduct,
) -> Result<i32, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    product_queries::create_product(&conn, product)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_product(
    app_handle: AppHandle,
    id: i32,
) -> Result<Product, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    product_queries::get_product(&conn, id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_all_products(app_handle: AppHandle) -> Result<Vec<Product>, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    product_queries::get_all_products(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_product(
    app_handle: AppHandle,
    id: i32,
    product: NewProduct,
) -> Result<(), String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    product_queries::update_product(&conn, id, product)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_product(
    app_handle: AppHandle,
    id: i32,
) -> Result<(), String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    product_queries::delete_product(&conn, id)
        .map_err(|e| e.to_string())
}

/* ========== CLIENTES ========== */
#[tauri::command]
pub async fn add_customer(
    app_handle: AppHandle,
    customer: NewCustomer,
) -> Result<i32, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    customer_queries::create_customer(&conn, customer)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_customer(
    app_handle: AppHandle,
    id: i32,
) -> Result<Customer, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    customer_queries::get_customer(&conn, id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_all_customers(app_handle: AppHandle) -> Result<Vec<Customer>, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    customer_queries::get_all_customers(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_customer(
    app_handle: AppHandle,
    id: i32,
    customer: NewCustomer,
) -> Result<(), String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    customer_queries::update_customer(&conn, id, customer)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_customer(
    app_handle: AppHandle,
    id: i32,
) -> Result<(), String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    customer_queries::delete_customer(&conn, id)
        .map_err(|e| e.to_string())
}

/* ========== VENTAS ========== */
#[tauri::command]
pub async fn create_sale(
    app_handle: AppHandle,
    sale: NewSale,
) -> Result<i32, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    sale_queries::create_sale(&conn, sale)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_sale(
    app_handle: AppHandle,
    id: i32,
) -> Result<Sale, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    sale_queries::get_sale(&conn, id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_sales_by_date_range(
    app_handle: AppHandle,
    start: String,
    end: String,
) -> Result<Vec<Sale>, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    
    // Convertir strings a NaiveDateTime
    let start_date = NaiveDateTime::parse_from_str(&start, "%Y-%m-%d %H:%M:%S")
        .map_err(|e| format!("Invalid start date format: {}", e))?;
    let end_date = NaiveDateTime::parse_from_str(&end, "%Y-%m-%d %H:%M:%S")
        .map_err(|e| format!("Invalid end date format: {}", e))?;
    
    sale_queries::get_sales_by_date_range(&conn, start_date, end_date)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn cancel_sale(
    app_handle: AppHandle,
    id: i32,
) -> Result<(), String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    sale_queries::cancel_sale(&conn, id)
        .map_err(|e| e.to_string())
}

/* ========== DETALLES DE VENTA ========== */
#[tauri::command]
pub async fn add_sale_detail(
    app_handle: AppHandle,
    detail: NewSaleDetail,
) -> Result<i32, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    sale_detail_queries::create_sale_detail(&conn, detail)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_sale_details(
    app_handle: AppHandle,
    sale_id: i32,
) -> Result<Vec<SaleDetailWithProduct>, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    sale_detail_queries::get_details_with_products_by_sale(&conn, sale_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn remove_sale_detail(
    app_handle: AppHandle,
    detail_id: i32,
) -> Result<(), String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    sale_detail_queries::delete_sale_detail(&conn, detail_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_sale_details_basic(
    app_handle: AppHandle,
    sale_id: i32,
) -> Result<Vec<SaleDetail>, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    sale_detail_queries::get_details_by_sale(&conn, sale_id)
        .map_err(|e| e.to_string())
}

/* ========== FACTURAS ========== */
#[tauri::command]
pub async fn create_invoice(
    app_handle: AppHandle,
    invoice: NewInvoice,
) -> Result<i32, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    invoice_queries::create_invoice(&conn, invoice)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_invoice_by_uuid(
    app_handle: AppHandle,
    uuid: String,
) -> Result<Invoice, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    invoice_queries::get_invoice_by_uuid(&conn, &uuid)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_invoices_by_sale(
    app_handle: AppHandle,
    sale_id: i32,
) -> Result<Vec<Invoice>, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    invoice_queries::get_invoices_by_sale(&conn, sale_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn cancel_invoice(
    app_handle: AppHandle,
    uuid: String,
) -> Result<(), String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    invoice_queries::cancel_invoice(&conn, &uuid)
        .map_err(|e| e.to_string())
}

/* ========== USUARIOS ========== */
#[tauri::command]
pub async fn create_user(
    app_handle: AppHandle,
    user: NewUser,
) -> Result<i32, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    user_queries::create_user(&conn, user)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn authenticate_user(
    app_handle: AppHandle,
    username: String,
    password: String,
) -> Result<Option<User>, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    user_queries::authenticate_user(&conn, &username, &password)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_user_password(
    app_handle: AppHandle,
    user_id: i32,
    new_password: String,
) -> Result<(), String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    user_queries::update_user_password(&conn, user_id, &new_password)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn deactivate_user(
    app_handle: AppHandle,
    user_id: i32,
) -> Result<(), String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    user_queries::deactivate_user(&conn, user_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_user_by_id(
    app_handle: AppHandle,
    user_id: i32,
) -> Result<User, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;

    match user_queries::get_user_by_id(&conn, user_id).map_err(|e| e.to_string())? {
        Some(user) => Ok(user),
        None => Err("User not found".to_string()),
    }
}

#[tauri::command]
pub async fn get_all_users(app_handle: tauri::AppHandle) -> Result<Vec<User>, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    user_queries::get_all_users(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_user(app_handle: tauri::AppHandle, user: User) -> Result<(), String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    user_queries::update_user(&conn, user).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_user(app_handle: tauri::AppHandle, user_id: i32) -> Result<bool, String> {
    let conn = establish_connection(&app_handle).map_err(|e| e.to_string())?;
    
    println!("Recibida solicitud para eliminar usuario ID: {}", user_id);
    
    match user_queries::delete_user(&conn, user_id) {
        Ok(_) => {
            println!("Usuario eliminado exitosamente");
            Ok(true)
        },
        Err(e) => {
            println!("Error al eliminar usuario: {}", e);
            Err(e.to_string())
        }
    }
}
