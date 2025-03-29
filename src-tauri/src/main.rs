#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod utils;

use commands::database::connection::initialize_database;
use commands::commands as db;
use tauri_plugin_fs::init as fs_init;

fn main() {
    tauri::Builder::default()
        .plugin(fs_init())
        .setup(|app| {
            // Inicialización de la base de datos
            initialize_database(app.handle())
                .map_err(|e| {
                    eprintln!("Error al inicializar la base de datos: {}", e);
                    e
                })
                .expect("Error crítico al inicializar la base de datos");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            /* ========== PRODUCTOS ========== */
            db::add_product,
            db::get_product,
            db::get_all_products,
            db::update_product,
            db::delete_product,
            
            /* ========== CLIENTES ========== */
            db::add_customer,
            db::get_customer,
            db::get_all_customers,
            db::update_customer,
            db::delete_customer,
            
            /* ========== VENTAS ========== */
            db::create_sale,
            db::get_sale,
            db::get_sales_by_date_range,
            db::cancel_sale,
            
            /* ========== DETALLES DE VENTA ========== */
            db::add_sale_detail,
            db::get_sale_details,
            db::remove_sale_detail,
            db::get_sale_details_basic,
            
            /* ========== FACTURAS ========== */
            db::create_invoice,
            db::get_invoice_by_uuid,
            db::get_invoices_by_sale,
            db::cancel_invoice,
            
            /* ========== USUARIOS ========== */
            db::create_user,
            db::authenticate_user,
            db::update_user_password,
            db::deactivate_user,
            db::get_user_by_id,
            db::get_all_users,
            db::update_user,
            db::delete_user,
        ])
        .run(tauri::generate_context!())
        .expect("Error al ejecutar la aplicación Tauri");
}