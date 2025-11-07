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

    if (!emails) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Save uploaded file (if exists)
    let uploadedPath = null;
    if (file && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      uploadedPath = path.join(process.cwd(), "public", file.name);
      await writeFile(uploadedPath, buffer);
    }

    // ✅ Use absolute path for default attachment
    const defaultAttachmentPath = path.join(
      process.cwd(),
      "public",
      "ankushchhabra02Resume_mern.pdf"
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const recipients = emails.split(",").map((e) => e.trim());

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: recipients,
      subject: subject || "📢 Default Automated Message",
      text:
        message ||
        "Hello! This is a predefined message from our automated system. Please find the attached document below.",
      attachments: [
        // Always include default
        {
          filename: "ankushchhabra02Resume_mern.pdf",
          path: defaultAttachmentPath,
        },
        // Optional user-uploaded
        ...(uploadedPath
          ? [
              {
                filename: path.basename(uploadedPath),
                path: uploadedPath,
              },
            ]
          : []),
      ],
    };

    await transporter.sendMail(mailOptions);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}
