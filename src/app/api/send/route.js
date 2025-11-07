import nodemailer from "nodemailer";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const emails = formData.get("emails");
    const subject = formData.get("subject");
    const message = formData.get("message");
    const file = formData.get("file");
    const secret = formData.get("secret"); // ✅ new

    if (secret !== process.env.EMAIL_SECRET_KEY) {
      return Response.json({ error: "Unauthorized access" }, { status: 403 });
    }
    if (!emails) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const isVercel = !!process.env.VERCEL; // true if deployed on Vercel

    // ✅ 1️⃣ Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const recipients = emails.split(",").map((e) => e.trim());

    // ✅ 2️⃣ Default attachment
    let defaultAttachment = null;

    if (isVercel) {
      // 🧠 On Vercel → Use hosted resume link
      defaultAttachment = {
        filename: "ankushchhabra02Resume_mern.pdf",
        path: `${process.env.NEXT_PUBLIC_BASE_URL}/ankushchhabra02Resume_mern.pdf`,
      };
    } else {
      // 🧠 Locally → Attach physical file from /public
      const defaultAttachmentPath = path.join(
        process.cwd(),
        "public",
        "ankushchhabra02Resume_mern.pdf"
      );
      defaultAttachment = {
        filename: "ankushchhabra02Resume_mern.pdf",
        path: defaultAttachmentPath,
      };
    }

    // ✅ 3️⃣ Handle optional uploaded file
    let userAttachment = null;

    if (file && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (isVercel) {
        // 🧠 On Vercel → attach in-memory
        userAttachment = {
          filename: file.name,
          content: buffer,
        };
      } else {
        // 🧠 Locally → write to /public
        const uploadedPath = path.join(process.cwd(), "public", file.name);
        await writeFile(uploadedPath, buffer);
        userAttachment = {
          filename: file.name,
          path: uploadedPath,
        };
      }
    }

    // ✅ 4️⃣ Compose mail
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: recipients,
      subject: subject || "📢 Default Automated Message",
      text:
        message ||
        (isVercel
          ? "Hello! This is your automated message. (Running on Vercel: Using hosted resume link)"
          : "Hello! This is your automated message. (Running locally: Attaching PDF file)"),
      attachments: userAttachment
        ? [defaultAttachment, userAttachment]
        : [defaultAttachment],
    };

    await transporter.sendMail(mailOptions);
    return Response.json({
      success: true,
      environment: isVercel ? "Vercel" : "Local",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}
