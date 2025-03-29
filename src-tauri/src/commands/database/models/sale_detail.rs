use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SaleDetail {
    pub id: i32,
    pub sale_id: i32,
    pub product_id: i32,
    pub quantity: i32,
    pub unit_price: f64,
    pub subtotal: f64,
    pub discount: f64,
    pub tax_amount: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewSaleDetail {
    pub sale_id: i32,
    pub product_id: i32,
    pub quantity: i32,
    pub unit_price: f64,
    pub discount: f64,
    pub tax_percentage: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaleDetailWithProduct {
    pub id: i32,
    pub sale_id: i32,
    pub product_id: i32,
    pub product_name: String,
    pub product_code: String,
    pub quantity: i32,
    pub unit_price: f64,
    pub subtotal: f64,
    pub discount: f64,
    pub tax_amount: f64,
}