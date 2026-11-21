import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";
const staticDir = path.join(__dirname, "etrion-website");
const teamFile = path.join(__dirname, "data", "team.json");

async function readTeam() {
  try {
    const raw = await fs.readFile(teamFile, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err && err.code === "ENOENT") return [];
    throw err;
  }
}

app.get("/api/team", async (_req, res) => {
  try {
    const members = await readTeam();
    res.json(members);
  } catch (err) {
    console.error("Failed to read team data:", err);
    res.status(500).json({ error: "Unable to load team members." });
  }
});

app.use("/api/*", (_req, res) => {
  res.status(404).json({ error: "API route not found." });
});

app.use(express.static(staticDir));
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log(`ETRION website running at http://${HOST}:${PORT}`);
});
