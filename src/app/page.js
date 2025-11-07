"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function Home() {
  const [emails, setEmails] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    toast.loading("📤 Sending email...");

    const formData = new FormData();
    formData.append("emails", emails);
    formData.append("subject", subject);
    formData.append("message", message);
    formData.append("secret", secret);
    if (file) formData.append("file", file);

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      toast.dismiss();

      if (data.success) {
        toast.success("✅ Email(s) sent successfully!");
        setEmails("");
        setSubject("");
        setMessage("");
        setFile(null);
      } else {
        toast.error("❌ Failed to send email.");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("⚠️ Server error, please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md min-w-lg text-white">
        <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-mail-icon lucide-mail"
          >
            <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
            <rect x="2" y="4" width="20" height="16" rx="2" />
          </svg>{" "}
          Smart Email Sender
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Recipient Emails (comma-separated)"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            required
            className="bg-white/20 placeholder-gray-200 text-white border border-white/30 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />

          <input
            type="text"
            placeholder="(Optional) Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-white/20 placeholder-gray-200 text-white border border-white/30 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />

          <textarea
            placeholder="(Optional) Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="bg-white/20 placeholder-gray-200 text-white border border-white/30 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
          />

          {/* ✅ Custom File Upload Section */}
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-300">Attachment</label>

            <div
              className={`relative flex items-center justify-between bg-white/20 rounded-lg p-2 border border-white/30 ${
                process.env.NEXT_PUBLIC_BASE_URL
                  ? "opacity-70 cursor-not-allowed"
                  : "opacity-100"
              }`}
            >
              {/* Upload button */}
              <label
                htmlFor="file-upload"
                className={`${
                  process.env.NEXT_PUBLIC_BASE_URL
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-pink-600 hover:bg-pink-700 cursor-pointer"
                } text-sm px-4 py-2 rounded-lg font-medium text-white transition-all duration-300 shadow-md`}
              >
                {process.env.NEXT_PUBLIC_BASE_URL
                  ? "Default Attached"
                  : "Choose File"}
              </label>

              {/* File input (hidden) */}
              <input
                id="file-upload"
                type="file"
                disabled={!!process.env.NEXT_PUBLIC_BASE_URL}
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />

              {/* File name or message */}
              <span className="text-sm text-gray-200 truncate max-w-[180px] ml-2">
                {process.env.NEXT_PUBLIC_BASE_URL
                  ? "ankushchhabra02Resume_mern.pdf (auto-attached)"
                  : file
                  ? file.name
                  : "No file selected"}
              </span>
            </div>

            {/* Environment hint below */}
            <p className="text-xs text-gray-400 italic mt-1">
              {process.env.NEXT_PUBLIC_BASE_URL
                ? "🌐 Running on Vercel — file upload disabled. Default resume auto-attached."
                : "💻 Running locally — you can attach an additional custom file."}
            </p>
          </div>
          <input
            type="password"
            placeholder="Enter Secret Key"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
            className="bg-white/20 placeholder-gray-200 text-white border border-white/30 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />

          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? "bg-gray-500" : "bg-pink-600 hover:bg-pink-700"
            } text-white rounded-xl p-3 font-semibold transition-all duration-300 shadow-lg`}
          >
            {loading ? "Sending..." : "Send Email(s)"}
          </button>
        </form>
      </div>

      <footer className="mt-6 text-sm text-gray-200 opacity-70">
        Made with ❤️ by Ankush
      </footer>
    </main>
  );
}
