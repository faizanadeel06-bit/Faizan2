export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  const masterPass = process.env.ADMIN_MASTER_PASSWORD;
  if (!masterPass) {
    return res.status(500).json({ ok: false, error: "Server password not configured." });
  }

  const { password } = req.body || {};
  if (password && password === masterPass) {
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: "Invalid owner password." });
}
