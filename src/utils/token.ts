
import type { Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthUser } from "../middleware/auth";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export function issueToken(payload: AuthUser, res: Response): void {
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.cookie("token", token, cookieOptions);
}

export function clearToken(res: Response): void {
  res.clearCookie("token", cookieOptions);
}
