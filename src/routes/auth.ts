import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { clearToken, issueToken } from "../utils/token";
import { protect, type AuthRequest } from "../middleware/auth";

import { randomBytes } from "node:crypto";

const router = Router();

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body as { credential?: string };

    if (!credential || !process.env.GOOGLE_CLIENT_ID) {
      res.status(400).json({ message: "Google login is not configured." });
      return;
    }

    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );

    if (!response.ok) {
      res.status(401).json({ message: "Invalid Google credential." });
      return;
    }

    const googleUser = await response.json() as {
      aud?: string;
      iss?: string;
      sub?: string;
      email?: string;
      email_verified?: string;
      name?: string;
      picture?: string;
    };

    if (
      googleUser.aud !== process.env.GOOGLE_CLIENT_ID ||
      !["accounts.google.com", "https://accounts.google.com"].includes(googleUser.iss || "") ||
      googleUser.email_verified !== "true" ||
      !googleUser.email ||
      !googleUser.sub
    ) {
      res.status(401).json({ message: "Google account verification failed." });
      return;
    }

    const email = googleUser.email.toLowerCase();
    let user = await User.findOne({ email }).select("+password");

    if (!user) {
      const randomPassword = randomBytes(32).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, 12);

      user = await User.create({
        name: googleUser.name || email.split("@")[0],
        email,
        password: passwordHash,
        photoURL: googleUser.picture || "",
      });
    } else if (!user.photoURL && googleUser.picture) {
      user.photoURL = googleUser.picture;
      await user.save();
    }

    issueToken(
      { id: user.id, email: user.email, name: user.name },
      res
    );

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Google login failed." });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, photoURL } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      photoURL?: string;
    };

    if (!name?.trim() || !email?.trim() || !password) {
      res.status(400).json({ message: "Name, email and password are required." });
      return;
    }

    if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      res.status(400).json({
        message: "Password must contain uppercase and lowercase letters and at least 6 characters.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({ message: "An account with this email already exists." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
      photoURL: photoURL || "",
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Could not create your account." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Email or password is incorrect." });
      return;
    }

    issueToken(
      { id: user.id, email: user.email, name: user.name },
      res,
    );

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

router.post("/logout", (_req, res) => {
  clearToken(res);
  res.json({ message: "You have been signed out." });
});

router.get("/me", protect, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user?.id).select("-password");
  if (!user) {
    res.status(404).json({ message: "User account not found." });
    return;
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    photoURL: user.photoURL,
  });
});

export default router;
