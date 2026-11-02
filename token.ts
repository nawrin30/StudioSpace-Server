import type { Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthUser } from "../middleware/auth";

export function issueToken(payload: AuthUser, res: Response): void {
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearToken(res: Response): void {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}
