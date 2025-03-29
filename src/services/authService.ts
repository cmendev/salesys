import { invoke } from "@tauri-apps/api/core";
import { User } from "../types/user";

export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const user = await invoke<User | null>("authenticate_user", { username, password });
    return user;
  } catch (error) {
    console.error("Error autenticando usuario:", error);
    return null;
  }
};