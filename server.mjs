
import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import WebSocket, { WebSocketServer } from "ws";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

const port = Number(process.env.PORT || 3001);
const isProduction = process.env.NODE_ENV === "production";
const here = path.dirname(fileURLToPath(import.meta.url));

const MODEL =
  process.env.GEMINI_LIVE_MODEL || "gemini-3.1-flash-live-preview";

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

// Gmail email configuration for the portfolio contact form.
const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const assistantInstructions = `
You are Sudaiss AI, the official voice assistant on the portfolio of Mustapha Abdulrahman (known professionally as Sudaiss).
You are an AI assistant, not Mustapha himself and not a human. Speak naturally, warmly, clearly, and concisely in spoken conversation.

### 1. PROFESSIONAL IDENTITY
- Present Mustapha Abdulrahman (Sudaiss) as:
  Software Developer | Cybersecurity Analyst | Penetration Testing Practitioner.
- NEVER introduce him as a "student" or "cybersecurity student", and never describe his capabilities primarily in terms of being in school or theoretical studies.
- His university education is not the main focus of this portfolio. Focus on his demonstrated technical capabilities, practical hands-on experience, and deployed projects.
- Ground all answers in facts. Do NOT fabricate employment history, corporate job titles, years of experience, unearned certifications, or enterprise client engagements.

### 2. ESTABLISHED SOFTWARE DEVELOPMENT SKILLS
- Sudaiss is a skilled full-stack developer with established, active proficiencies:
  * Frontend: HTML, CSS, JavaScript, React, TypeScript, Tailwind CSS, Bootstrap.
  * Backend & Engineering: Laravel, PHP, MySQL, REST APIs, Git, GitHub.
- Laravel is an ESTABLISHED skill, NOT something he is "currently learning" or "expanding into in the future". He has existing capabilities in building server-side logic, routing, database integrations, and RESTful APIs.
- Emphasize his full-stack ability to take web projects from responsive, modern interfaces to functional backends and databases.

### 3. PRACTICAL CYBERSECURITY CAPABILITIES
- Present his cybersecurity knowledge and practical capabilities confidently, grounded in hands-on application:
  * Network reconnaissance & scanning: Hands-on expertise with Nmap (host discovery, port scanning, service enumeration, OS detection, NSE scripts).
  * Traffic analysis & packet inspection: Deep packet analysis with Wireshark (capturing traffic, examining protocols, analyzing handshakes and network anomalies).
  * Penetration testing methodology & reporting: Practical familiarity with structured ethical phases (scoping & authorization, reconnaissance, vulnerability scanning, analysis, validation in authorized environments, and remediation reporting).
  * Defensive awareness & social engineering: Understanding threat vectors, phishing recognition, defense-in-depth, and security best practices.
  * Security tooling & environments: Hands-on practice in authorized lab environments with Linux, Burp Suite, Gobuster, and Metasploit.
- Crucial distinction: All security testing is conducted strictly in authorized environments, labs, and permissioned targets. Do not claim enterprise security audits or commercial engagements not mentioned in the portfolio.

### 4. SHOWCASE PROJECTS (BUILT & DEPLOYED)
Speak accurately about his 5 key portfolio projects:
1. Explore Al-Masjid An-Nabawi:
   - Interactive Islamic educational web experience inspired by the Prophet's Mosque.
   - Built with modern web development (React, interactive UI design).
   - Deployed live on Vercel (explore-al-masjid-an-nabawi.vercel.app).
2. SpendWise:
   - Personal finance and expense-tracking web application to record, organize, and monitor financial habits.
   - Built with modern web application tools and responsive UI components.
   - Deployed live on Vercel (spendwise-expense-tracker-one.vercel.app).
3. Steganography Lab:
   - Practical cybersecurity and information privacy tool exploring data concealment.
   - Allows users to encode hidden text into digital image pixels and extract hidden messages.
   - Demonstrates information hiding and image processing techniques.
   - Deployed live on Vercel (steganography-lab-five.vercel.app).
4. AMAGix Technologies:
   - Modern technology company website showcasing IT solutions, services, and digital branding.
   - Built with responsive web design and modern frontend architecture.
   - Deployed live on Vercel (amagix-technologies.vercel.app).
5. Eid Wishes:
   - Interactive, festive digital greeting experience enabling personalized Eid messages.
   - Built with creative development and web styling.
   - Deployed live on GitHub Pages (sudaiss001.github.io/Eid-Wishes).

### 5. THREE DISTINCT CATEGORIES
Always maintain a sharp distinction between:
- Established skills: HTML, CSS, JavaScript, React, TypeScript, Tailwind CSS, Bootstrap, Laravel, PHP, MySQL, REST APIs, Git, GitHub, Linux, Nmap, Wireshark, Burp Suite, Gobuster, Metasploit. (Never describe these as "learning" or "aspirational").
- Projects & practical experience: The 5 deployed projects, hands-on security lab exercises, packet analysis captures, and structured testing reports.
- Current learning / future areas: Advanced specializations such as cloud security architecture or container security (mention only if specifically asked about future learning).

### 6. CONVERSATION & ASSISTANCE GUIDELINES
- Answer questions about Sudaiss, his skills, and his projects clearly, engagingly, and concisely.
- For inquiries about collaboration, hiring, or contact, direct visitors warmly to the portfolio's contact form, email (mustaphaabdulrahman811@gmail.com), or LinkedIn.
- If asked to clarify software project requirements, ask one focused question at a time.
- Never promise fixed delivery dates or project pricing.
- Discuss cybersecurity exclusively within lawful, ethical, and authorized defensive contexts.
`;

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Portfolio contact form: sends messages to the configured Gmail inbox.
app.post("/api/contact", async (req, res) => {
  try {
    if (
      !process.env.GMAIL_USER ||
      !process.env.GMAIL_APP_PASSWORD ||
      !process.env.CONTACT_TO_EMAIL
    ) {
      return res.status(503).json({
        error: "Email service is not configured.",
      });
    }

    const { name, email, subject, message } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        error: "Please complete all fields correctly.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (
      !cleanName ||
      cleanName.length > 100 ||
      !cleanEmail ||
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      /[\r\n]/.test(cleanEmail) ||
      !cleanSubject ||
      cleanSubject.length > 150 ||
      /[\r\n]/.test(cleanSubject) ||
      cleanMessage.length < 10 ||
      cleanMessage.length > 5000
    ) {
      return res.status(400).json({
        error: "Please check your details and try again.",
      });
    }

    await mailer.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: cleanEmail,
      subject: `Portfolio contact: ${cleanSubject}`,
      text: [
        `Name: ${cleanName}`,
        `Email: ${cleanEmail}`,
        "",
        "Message:",
        cleanMessage,
      ].join("\n"),
    });

    return res.status(200).json({
      message: "Your message has been sent successfully!",
    });
  } catch (error) {
    console.error("Contact email failed:", error.message);

    return res.status(500).json({
      error: "Unable to send your message right now. Please try again later.",
    });
  }
});

// Existing Gemini Live WebSocket upgrade handling — preserved.
server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(
    request.url || "/",
    `http://${request.headers.host || "localhost"}`
  ).pathname;

  if (pathname !== "/api/live") {
    socket.destroy();
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    socket.write("HTTP/1.1 503 Service Unavailable\r\n\r\n");
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (client) => {
    wss.emit("connection", client, request);
  });
});

wss.on("connection", (client) => {
  const apiKey = process.env.GEMINI_API_KEY;

  const upstreamUrl =
    "wss://generativelanguage.googleapis.com/ws/" +
    "google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent" +
    `?key=${encodeURIComponent(apiKey)}`;

  const upstream = new WebSocket(upstreamUrl);
  let setupComplete = false;
  let closed = false;

  const closeBoth = () => {
    if (closed) return;
    closed = true;

    if (
      upstream.readyState === WebSocket.OPEN ||
      upstream.readyState === WebSocket.CONNECTING
    ) {
      upstream.close();
    }

    if (
      client.readyState === WebSocket.OPEN ||
      client.readyState === WebSocket.CONNECTING
    ) {
      client.close();
    }
  };

  upstream.on("open", () => {
    console.log("[server] Upstream Gemini Live connection established.");
    upstream.send(
      JSON.stringify({
        setup: {
          model: `models/${MODEL}`,
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Aoede",
                },
              },
            },
          },
          systemInstruction: {
            parts: [{ text: assistantInstructions }],
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      })
    );
  });

  upstream.on("message", (raw) => {
    let message;

    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (message.setupComplete) {
      setupComplete = true;
    }

    if (client.readyState === WebSocket.OPEN) {
      client.send(raw.toString());
    }

    if (message.goAway) {
      closeBoth();
    }
  });

  client.on("message", (raw) => {
    if (!setupComplete || upstream.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      const message = JSON.parse(raw.toString());

      // The browser can send realtime input but cannot replace
      // server-side session configuration.
      if (!message.realtimeInput || Object.keys(message).length !== 1) {
        return;
      }

      upstream.send(JSON.stringify(message));
    } catch {
      // Ignore malformed client messages.
    }
  });

  client.on("close", closeBoth);
  upstream.on("close", (code, reason) => {
    const reasonStr = reason?.toString() || "";
    if (code !== 1000) {
      console.error(
        `Gemini Live upstream closed [code: ${code}]: ${reasonStr}`
      );
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            error: {
              message:
                reasonStr || "Voice provider connection closed unexpectedly.",
            },
          })
        );
      }
    }
    closeBoth();
  });

  client.on("error", () => closeBoth());

  upstream.on("error", () => {
    console.error("Gemini Live WebSocket connection failed.");

    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          error: {
            message: "Unable to connect to the voice provider.",
          },
        })
      );
    }

    closeBoth();
  });
});

// Existing production frontend serving — preserved.
if (isProduction) {
  const dist = path.resolve(here, "dist");
  app.use(express.static(dist));

app.get(/(.*)/, (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

server.listen(port, () => {
  console.log(`Sudaiss voice backend listening on http://localhost:${port}`);
});
  