import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Coffee, Mail, Lock } from "lucide-react-native";

import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";
import { useApp } from "@/contexts/AppContext";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      await login(email, password);
      router.replace("/home");
    } catch (err: any) {
      console.log("Login error:", err);
      
      if (err.message) {
        setError(err.message);
      } else if (err.data?.code === "UNAUTHORIZED") {
        setError("Invalid email or password");
      } else if (err.data?.code === "TOO_MANY_REQUESTS") {
        setError("Too many attempts. Please try again later");
      } else {
        setError("Login failed. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Coffee size={48} color={Colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Signing In..." : "Sign In"}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.businessButton}>
            <Text style={styles.businessButtonText}>Continue as Business</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={handleSignup}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    ...typography.h1,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: Colors.textSecondary,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: Colors.text,
    paddingVertical: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: Colors.primary,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    ...typography.button,
    color: Colors.cardBackground,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    marginHorizontal: 16,
  },
  businessButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  businessButtonText: {
    ...typography.button,
    color: Colors.primary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: {
    ...typography.body,
    color: Colors.textSecondary,
  },
  footerLink: {
    ...typography.body,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  errorText: {
    ...typography.bodySmall,
    color: "#DC2626",
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
