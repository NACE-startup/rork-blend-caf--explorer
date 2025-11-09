import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "blend_auth_token";

export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
}

export async function removeAuthToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error removing auth token:", error);
  }
}
