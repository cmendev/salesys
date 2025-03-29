use serde::{Serialize, Deserialize};
use chrono::NaiveDateTime;

#[derive(Debug, Serialize, Deserialize)]
pub struct Sale {
    pub id: i32,
    #[serde(with = "crate::utils::date_format")]
    pub date: NaiveDateTime,
    pub customer_id: Option<i32>,
    pub subtotal: f64,
    pub taxes: f64,
    pub total: f64,
    pub payment_method: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewSale {
    pub customer_id: Option<i32>,
    pub subtotal: f64,
    pub taxes: f64,
    pub total: f64,
    pub payment_method: String,
    pub status: Option<String>,
}