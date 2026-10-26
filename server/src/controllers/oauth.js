// Google + GitHub sign-in using the plain OAuth 2.0 authorization-code flow (no extra packages; Node 18+ has fetch).
//   browser -> GET /api/auth/<provider>            -> redirect to the provider
//   provider -> GET /api/auth/<provider>/callback  -> we exchange the code, upsert the user in MongoDB,
//   then redirect to  <CLIENT_ORIGIN>/auth/callback#token=<jwt>
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError, asyncHandler } from "../middleware/error.js";
import { signToken } from "../middleware/auth.js";

const client = env.clientOrigin[0];
const redirectUri = (p) => `${env.serverUrl}/api/auth/${p}/callback`;
const state = () => jwt.sign({ n: Math.random().toString(36).slice(2) }, env.jwtSecret, { expiresIn: "10m" }); // signed, short-lived CSRF token

const providers = {
  google: {
    cfg: env.google,
    authUrl: (st) => "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({ client_id: env.google.id, redirect_uri: redirectUri("google"), response_type: "code", scope: "openid email profile", state: st, prompt: "select_account" }),
    async profile(code) {
      const t = await post("https://oauth2.googleapis.com/token", new URLSearchParams({ code, client_id: env.google.id, client_secret: env.google.secret, redirect_uri: redirectUri("google"), grant_type: "authorization_code" }));
      const u = await get("https://openidconnect.googleapis.com/v1/userinfo", t.access_token);
      if (!u.email || u.email_verified === false) throw new AppError(400, "Your Google account has no verified email");
      return { id: u.sub, email: u.email, name: u.name || u.email.split("@")[0], avatar: u.picture || "" };
    },
  },
  github: {
    cfg: env.github,
    authUrl: (st) => "https://github.com/login/oauth/authorize?" + new URLSearchParams({ client_id: env.github.id, redirect_uri: redirectUri("github"), scope: "read:user user:email", state: st }),
    async profile(code) {
      const t = await post("https://github.com/login/oauth/access_token", new URLSearchParams({ code, client_id: env.github.id, client_secret: env.github.secret, redirect_uri: redirectUri("github") }));
      const u = await get("https://api.github.com/user", t.access_token);
      let email = u.email; // may be private -> ask the emails endpoint
      if (!email) {
        const list = await get("https://api.github.com/user/emails", t.access_token);
        email = list.find((e) => e.primary && e.verified)?.email || list.find((e) => e.verified)?.email;
      }
      if (!email) throw new AppError(400, "Your GitHub account has no verified email");
      return { id: String(u.id), email, name: u.name || u.login, avatar: u.avatar_url || "" };
    },
  },
};

async function post(url, body) {
  const r = await fetch(url, { method: "POST", headers: { Accept: "application/json" }, body });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error || !j.access_token) throw new AppError(502, "The sign-in provider rejected the request");
  return j;
}
async function get(url, token) {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "User-Agent": "ascii-cam" } });
  if (!r.ok) throw new AppError(502, "Could not read your profile from the provider");
  return r.json();
}

// Which buttons the login page should show (only providers that have keys in .env).
export const available = (_req, res) => res.json({ google: !!(env.google.id && env.google.secret), github: !!(env.github.id && env.github.secret) });

export const start = (name) => (_req, res, next) => {
  const p = providers[name];
  if (!p.cfg.id || !p.cfg.secret) return next(new AppError(501, `${name} sign-in is not configured on the server`));
  res.redirect(p.authUrl(state()));
};

export const callback = (name) =>
  asyncHandler(async (req, res) => {
    const fail = (msg) => res.redirect(`${client}/login?error=${encodeURIComponent(msg)}`);
    const { code, state: st, error } = req.query;
    if (error || !code) return fail("Sign-in was cancelled");
    try { jwt.verify(String(st), env.jwtSecret); } catch { return fail("Sign-in expired, please try again"); }

    let prof;
    try { prof = await providers[name].profile(String(code)); } catch (e) { return fail(e.message || "Sign-in failed"); }

    const idField = `${name}Id`;
    let user = await User.findOne({ [idField]: prof.id });
    if (!user) user = await User.findOne({ email: prof.email.toLowerCase() }); // same email -> link to the existing account
    if (user) {
      if (!user[idField]) user[idField] = prof.id;
      if (!user.providers.includes(name)) user.providers.push(name);
      if (!user.avatar && prof.avatar) user.avatar = prof.avatar;
      await user.save();
    } else {
      user = await User.create({ name: prof.name.slice(0, 50).padEnd(2, " "), email: prof.email, [idField]: prof.id, avatar: prof.avatar, providers: [name] });
    }
    res.redirect(`${client}/auth/callback#token=${signToken(user._id)}`);
  });
