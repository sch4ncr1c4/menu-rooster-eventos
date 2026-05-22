const fs = require("node:fs/promises");
const path = require("node:path");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";
const DATA_FILE = path.join(__dirname, "data", "menu.json");

app.use(cors());
app.use(express.json());

async function readMenu() {
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw);
}

async function writeMenu(menu) {
  await fs.writeFile(DATA_FILE, JSON.stringify(menu, null, 2), "utf8");
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Token invalido o expirado" });
  }
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "menu-rooster-backend",
    date: new Date().toISOString(),
  });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};

  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "8h" });
  return res.json({ token });
});

app.get("/api/menu", async (_req, res) => {
  try {
    const menu = await readMenu();
    return res.json(menu);
  } catch (error) {
    return res.status(500).json({ message: "No se pudo leer el menu", error: String(error) });
  }
});

app.put("/api/admin/menu", requireAuth, async (req, res) => {
  const payload = req.body || {};
  if (!payload.eventName || !Array.isArray(payload.products)) {
    return res.status(400).json({ message: "Formato invalido de menu" });
  }

  try {
    await writeMenu(payload);
    return res.json({ ok: true, menu: payload });
  } catch (error) {
    return res.status(500).json({ message: "No se pudo guardar el menu", error: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Admin user: ${ADMIN_USER}`);
});
