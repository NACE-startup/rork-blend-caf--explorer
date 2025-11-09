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
import { Coffee, Mail, Lock, User } from "lucide-react-native";

import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";
import { useApp } from "@/contexts/AppContext";

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    if (name.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      await signup(name, email, password, false);
      router.replace("/home");
    } catch (err: any) {
      console.log("Signup error:", err);
      
      if (err.message) {
        setError(err.message);
      } else if (err.data?.code === "CONFLICT") {
        setError("An account with this email already exists");
      } else if (err.data?.code === "BAD_REQUEST") {
        setError("Invalid input. Please check your information");
      } else {
        setError("Signup failed. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.back();
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
          <Text style={styles.title}>Join Blend</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={Colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

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

          <Text style={styles.terms}>
            By signing up, you agree to our{" "}
            <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Creating Account..." : "Create Account"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.footerLink}>Sign In</Text>
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
  terms: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: "600" as const,
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
