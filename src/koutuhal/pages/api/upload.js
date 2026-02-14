import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export const config = {
  api: {
    bodyParser: false, // important for file uploads
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // use service role on server
);

function parseForm(req) {
  const formidable = require("formidable");
  const form = new formidable.IncomingForm({ keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

// Formidable sends field values as arrays; normalize to string
function getField(fields, key) {
  const v = fields[key];
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function getFile(files, key) {
  const f = files[key];
  if (f == null) return null;
  return Array.isArray(f) ? f[0] : f;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fields, files } = await parseForm(req);

    const name = getField(fields, "name");
    const email = getField(fields, "email");
    const phone = getField(fields, "phone");
    const role = getField(fields, "role");
    const job_description = getField(fields, "job_description");
    const resumeFile = getFile(files, "resume");

    if (!name || !email || !resumeFile) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1) Upsert user (avoid duplicate email)
    let { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", String(email).trim())
      .single();

    let user;
    if (existingUser) {
      user = existingUser;
    } else {
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert([{ name: String(name).trim(), email: String(email).trim(), phone: phone ? String(phone).trim() : null }])
        .select()
        .single();

      if (userError) throw userError;
      user = newUser;
    }

    // 2) Read file & extract text
    const fileBuffer = fs.readFileSync(resumeFile.filepath);
    let resumeText = "";
    try {
      // Use a child process to avoid Webpack bundling issues with pdf-parse
      const scriptPath = path.join(process.cwd(), "lib", "extractPdf.js");
      const result = execSync(
        `node "${scriptPath}" "${resumeFile.filepath}"`,
        { encoding: "utf-8", timeout: 30000 }
      );
      resumeText = result.trim();
      console.log(`PDF parsed: ${resumeText.length} characters extracted`);
    } catch (pdfError) {
      console.error("PDF extraction error:", pdfError.message);
      resumeText = "";
    }

    // 3) Upload file to Supabase Storage
    const filePath = `${user.id}/${Date.now()}_${resumeFile.originalFilename}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, fileBuffer, {
        contentType: resumeFile.mimetype,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("resumes")
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData.publicUrl;

    // 4) Insert resume row
    const { data: resumeRow, error: resumeError } = await supabase
      .from("resumes")
      .insert([
        {
          user_id: user.id,
          file_path: filePath,
          url: fileUrl,
          resume_text: resumeText,
        },
      ])
      .select()
      .single();

    if (resumeError) throw resumeError;

    // 5) Return response
    return res.status(200).json({
      user_id: user.id,
      resume_id: resumeRow.id,
      resume_text: resumeText,
      role,
      job_description,
    });
  } catch (err) {
    console.error(err);
    const details = err.message || String(err);
    const code = err.code || err?.error?.code;
    const isSchemaError = details.includes("PGRST204") || details.includes("schema cache");
    const fixHint = isSchemaError
      ? " Run in Supabase → SQL Editor: ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS url TEXT, ADD COLUMN IF NOT EXISTS resume_text TEXT; then wait ~30s for schema cache to refresh."
      : "";
    return res.status(500).json({
      error: "Upload failed",
      details: details + (code ? ` (${code})` : "") + fixHint,
    });
  }
}
