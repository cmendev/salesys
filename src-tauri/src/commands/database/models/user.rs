use serde::{Serialize, Deserialize};
use std::fmt;

#[derive(Debug, Serialize, Deserialize)]
pub enum UserRole {
    Admin,
    Seller,
    Manager,
}

impl fmt::Display for UserRole {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            UserRole::Admin => write!(f, "admin"),
            UserRole::Seller => write!(f, "seller"),
            UserRole::Manager => write!(f, "manager"),
        }
    }
}

impl From<&str> for UserRole {
    fn from(value: &str) -> Self {
        match value {
            "admin" => UserRole::Admin,
            "seller" => UserRole::Seller,
            "manager" => UserRole::Manager,
            _ => UserRole::Seller, // Default fallback
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub email: String,
    pub password_hash: String,
    pub role: UserRole,
    pub full_name: String,
    pub is_active: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewUser {
    pub username: String,
    pub email: String,
    pub password: String,
    pub role: UserRole,
    pub full_name: String,
}