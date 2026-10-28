/**
 * Maps Firebase Auth / app errors to messages a reader can act on.
 * Unknown errors fall back to a generic message but are always logged by callers.
 */
export function friendlyAuthError(
  err: unknown,
  action: "sign-in" | "sign-up" | "reset" = "sign-in",
): string {
  const code = (err as { code?: string } | null)?.code ?? "";

  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/weak-password":
      return "Choose a stronger password (at least 6 characters).";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
      return action === "reset"
        ? "If an account exists for this email, a reset link is on its way."
        : "No account found with this email.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "Incorrect email or password.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Allow popups and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled yet. The site owner must enable it in Firebase Authentication.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for sign-in. The site owner must add it under Firebase Authentication → Settings → Authorized domains.";
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
    case "auth/configuration-not-found":
    case "auth/app-not-authorized":
    case "app/not-configured":
      return "Sign-in is temporarily unavailable because the site is not fully configured. Please try again later.";
    default:
      return action === "sign-up"
        ? "We couldn't create your account. Please try again."
        : action === "reset"
          ? "We couldn't send the reset email. Please try again."
          : "We couldn't sign you in. Please try again.";
  }
}

/** Basic client-side password policy (Firebase itself only enforces 6+). */
export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include at least one letter and one number.";
  }
  return null;
}

/** Only allow same-site relative redirects (prevents open redirects via ?next=). */
export function safeRedirect(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  if (next.startsWith("/auth/")) return fallback;
  return next;
}
