import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

// Decode base64 JWT private key and set it as environment variable
if (process.env.JWT_PRIVATE_KEY_BASE64) {
  try {
    const decodedKey = atob(process.env.JWT_PRIVATE_KEY_BASE64);
    process.env.JWT_PRIVATE_KEY = decodedKey;
  } catch (error) {
    console.error("Failed to decode JWT_PRIVATE_KEY_BASE64:", error);
  }
}

const { auth, signIn, signOut, store: _store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
        };
      },
    }),
  ],
  session: {
    cookieName: "session",
    password: process.env.SESSION_PASSWORD!,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    },
  },
});

// Custom store function that creates users with proper role
export const store = _store;
export { auth, signIn, signOut, isAuthenticated };
