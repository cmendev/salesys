use serde::{Serialize, Deserialize};
use chrono::NaiveDateTime;

#[derive(Debug, Serialize, Deserialize)]
pub struct Invoice {
    pub id: i32,
    pub sale_id: i32,
    pub uuid: String,
    #[serde(with = "crate::utils::date_format")]
    pub date: NaiveDateTime,
    pub file_path: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewInvoice {
    pub sale_id: i32,
    pub uuid: String,
    pub file_path: String,
    pub status: Option<String>,
}