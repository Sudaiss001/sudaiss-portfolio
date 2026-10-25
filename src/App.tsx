import { useEffect, useState, type FormEvent } from "react";
import VoiceAssistant from "./VoiceAssistant";


type Certificate = {
  id: string;
  title: string;
  category: string;
  provider: string;
  status: string;
  description: string;
  certificateImage: string;
  certificateLink: string;
};

function CertificationContent({
  certificates,
}: {
  certificates: Certificate[];
}) {
  const [selected, setSelected] = useState<Certificate | null>(null);

  useEffect(() => {
    if (!selected) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selected]);

  return (
    <>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-amber-700">
            Learning & Recognition
          </p>

          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Certifications<span className="text-amber-700">.</span>
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-600">
            Training and achievements contributing to my journey in
            software development and cybersecurity.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {certificates.map((certificate, index) => (
            <article
              key={certificate.id}
              className="group flex flex-col rounded-3xl border border-amber-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg sm:p-7"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-lg font-extrabold text-amber-800 transition group-hover:bg-slate-950 group-hover:text-white">
                  0{index + 1}
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {certificate.category}
                </span>
              </div>

              <h3 className="mt-6 text-xl font-extrabold leading-snug text-slate-900">
                {certificate.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {certificate.provider}
              </p>

              <button
                type="button"
                onClick={() => setSelected(certificate)}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-600"
              >
                View Details
                <span aria-hidden="true">↗</span>
              </button>
            </article>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="certificate-title"
            className="relative my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-[#fcfaf5] p-6 shadow-2xl sm:p-9"
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close certification details"
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-slate-700 shadow-sm transition hover:bg-slate-950 hover:text-white"
            >
              ×
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <path d="M7 3h8l5 5v13H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z" />
                <path d="M15 3v6h5M8 14h7M8 17h7" />
              </svg>
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
              {selected.category}
            </p>

            <h3
              id="certificate-title"
              className="mt-3 pr-8 text-2xl font-extrabold leading-snug text-slate-900 sm:text-3xl"
            >
              {selected.title}
            </h3>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Training provider
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {selected.provider}
              </p>

              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                {selected.status}
              </p>
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-600">
              {selected.description}
            </p>

            {selected.certificateImage ? (
              <div className="mt-6">
                <p className="mb-3 text-sm font-bold text-slate-900">
                  Certificate
                </p>
                <img
                  src={selected.certificateImage}
                  alt={`${selected.title} certificate`}
                  className="w-full rounded-xl border border-slate-200 bg-white object-contain"
                />
              </div>
            ) : (
              <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-slate-600">
                Certificate image not added yet. You can add it later without
                changing the layout.
              </p>
            )}

            {selected.certificateLink && (
              <a
                href={selected.certificateLink}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-amber-800 hover:text-amber-600"
              >
                Visit provider website <span aria-hidden="true">↗</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-7 w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const navigation = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Certifications", href: "#certifications" },
  { label: "Contact", href: "#contact" },
]

function App() {
  const [isSending, setIsSending] = useState(false);
  const [contactStatus, setContactStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleContactSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (isSending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    setIsSending(true);
    setContactStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to send your message. Please try again."
        );
      }

      setContactStatus({
        type: "success",
        message: result.message || "Message sent successfully!",
      });
      form.reset();
    } catch (error) {
      setContactStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col overflow-x-clip bg-[#fcfaf5] text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 px-5 pt-5 sm:px-8 lg:px-12">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-2xl border border-white/80 bg-white/85 px-5 py-4 shadow-lg shadow-stone-900/5 backdrop-blur-md">
          <a href="#" className="shrink-0 text-xl font-extrabold tracking-tight">
            Sudaiss<span className="text-amber-600">.</span>
            <span className="ml-1">👑</span>
          </a>

          <div className="hidden items-center gap-6 lg:flex">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition hover:text-amber-700"
              >
                {item.label}
              </a>
            ))}
          </div>

          <a
            href="#contact"
            className="shrink-0 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Let's Talk <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero-background relative isolate">
        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:px-16 lg:py-20">
          {/* Introduction */}
          <div className="relative z-10">
            <p className="mb-6 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              <span className="h-px w-10 bg-amber-600" />
              Software Developer · Cybersecurity
            </p>

            <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl xl:text-7xl">
              Building practical
              <br />
              <span className="text-amber-700">digital solutions.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              I'm Mustapha Abdulrahman, known as Sudaiss. I build web
              applications and explore cybersecurity to create useful,
              thoughtful, and secure digital experiences.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#projects"
                className="inline-flex items-center gap-3 rounded-xl bg-slate-950 px-6 py-4 font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-amber-700"
              >
                View My Work <span aria-hidden="true">→</span>
              </a>

              <a
                href="#contact"
                className="inline-flex items-center gap-3 rounded-xl border border-amber-300 bg-white/80 px-6 py-4 font-semibold text-slate-800 transition hover:-translate-y-1 hover:border-amber-600"
              >
                Contact Me <span aria-hidden="true">↗</span>
              </a>
            </div>

            <p className="mt-8 text-sm text-slate-500">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Open to learning, collaboration, and meaningful projects
            </p>
          </div>

          {/* Profile photo */}
          <div className="relative mx-auto flex w-full max-w-md items-center justify-center py-8">
            <div className="absolute h-72 w-72 rounded-full bg-amber-200/40 blur-3xl sm:h-96 sm:w-96" />

            <div className="relative h-72 w-72 sm:h-96 sm:w-96">
              {/* Animated orange arc */}
              <svg
                className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
                viewBox="0 0 100 100"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="48.5"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="82 219.5"
                  className="profile-orbit"
                />
              </svg>

              <div className="absolute inset-0 overflow-hidden rounded-full border-[8px] border-white bg-[#eee5d2] shadow-2xl shadow-stone-900/15">
                <img
                  src="/sudaiss.jpg"
                  alt="Portrait of Mustapha Abdulrahman, known as Sudaiss"
                  className="h-full w-full object-cover object-center"
                />
              </div>

              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-100 bg-white px-6 py-3 text-sm font-medium text-slate-600 shadow-lg">
                Hello, I'm Sudaiss 👋
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="scroll-mt-8 border-t border-amber-100/70 bg-white px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* About Text */}
          <div>
            <p className="mb-5 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-amber-700">
              <span className="h-px w-10 bg-amber-600" />
              Get to know me
            </p>

            <h2 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Turning curiosity into{" "}
              <span className="text-amber-700">technology.</span>
            </h2>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              I'm Mustapha Abdulrahman, known as Sudaiss — a software developer,
              cybersecurity analyst, and penetration testing practitioner passionate about building useful
              digital solutions and understanding how to make them more secure.
            </p>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              From developing web applications to exploring network security
              and penetration testing in authorized environments, I believe
              in learning by building, solving real problems, and improving
              through consistent practice.
            </p>

            <div className="mt-9 grid max-w-xl gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-100 bg-[#fcfaf5] p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <span className="text-xl" aria-hidden="true">
                    {"</>"}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900">
                  Software Development
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Creating responsive web experiences and practical applications.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-[#fcfaf5] p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <span className="text-xl" aria-hidden="true">⌘</span>
                </div>
                <h3 className="font-bold text-slate-900">
                  Cybersecurity
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Exploring network security and ethical penetration testing.
                </p>
              </div>
            </div>
          </div>

          {/* Original Code-Inspired Visual */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-[2rem] bg-amber-100/60 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-[#111827] shadow-2xl shadow-slate-900/15">
              {/* Terminal Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs tracking-wide text-slate-400">
                  sudaiss.dev
                </span>
              </div>

              {/* Code Content */}
              <div className="space-y-5 p-6 font-mono text-sm leading-7 sm:p-8">
                <p className="text-slate-500">
                  {"// A little about my approach"}
                </p>

                <p>
                  <span className="text-purple-400">const</span>{" "}
                  <span className="text-sky-300">developer</span>{" "}
                  <span className="text-white">= {"{"}</span>
                </p>

                <div className="pl-5">
                  <p>
                    <span className="text-sky-200">name</span>
                    <span className="text-white">:</span>{" "}
                    <span className="text-emerald-300">
                      "Mustapha Abdulrahman"
                    </span>
                    <span className="text-white">,</span>
                  </p>
                  <p>
                    <span className="text-sky-200">alias</span>
                    <span className="text-white">:</span>{" "}
                    <span className="text-emerald-300">"Sudaiss"</span>
                    <span className="text-white">,</span>
                  </p>
                  <p>
                    <span className="text-sky-200">focus</span>
                    <span className="text-white">:</span>{" "}
                    <span className="text-emerald-300">
                      "Software + Security"
                    </span>
                    <span className="text-white">,</span>
                  </p>
                  <p>
                    <span className="text-sky-200">mindset</span>
                    <span className="text-white">:</span>{" "}
                    <span className="text-emerald-300">
                      "Build. Learn. Improve."
                    </span>
                  </p>
                </div>

                <p className="text-white">{"}"}</p>

                <div className="mt-8 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                  <p className="flex items-center gap-2 text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Always building, always improving.
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Accent */}
            <div className="absolute -right-3 -top-5 rounded-2xl border border-amber-200 bg-white px-4 py-3 shadow-lg sm:-right-5">
              <span className="text-sm font-bold text-slate-800">
                Sudaiss <span className="text-amber-600">👑</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section placeholders */}
      
{/* Skills Section */}
<section
  id="skills"
  className="scroll-mt-8 bg-[#fcfaf5] px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
>
  <div className="mx-auto max-w-7xl">
    {/* Section Heading */}
    <div className="mx-auto mb-16 max-w-2xl text-center">
      <p className="mb-5 flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-amber-700">
        <span className="h-px w-10 bg-amber-600" />
        What I work with
        <span className="h-px w-10 bg-amber-600" />
      </p>

      <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
        My Technical <span className="text-amber-700">Skills.</span>
      </h2>

      <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
        Technologies and tools I use to build digital experiences,
        develop applications, and explore cybersecurity.
      </p>
    </div>

    {/* Skill Categories */}
    <div className="grid gap-7 lg:grid-cols-3">
      {/* Frontend */}
      <article className="group rounded-3xl border border-amber-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-900/5 sm:p-8">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 transition group-hover:bg-slate-950 group-hover:text-white">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 9h18M8 14l-2 2 2 2m4 0 2-2-2-2" />
          </svg>
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
          01 / Development
        </p>

        <h3 className="mt-3 text-2xl font-extrabold text-slate-900">
          Frontend
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Building responsive, accessible interfaces with modern
          frontend technologies.
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          {[
            "HTML",
            "CSS",
            "JavaScript",
            "React",
            "TypeScript",
            "Tailwind CSS",
            "Bootstrap",
          ].map((skill) => (
            <span
              key={skill}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
            >
              {skill}
            </span>
          ))}
        </div>
      </article>

      {/* Backend */}
      <article className="group rounded-3xl border border-amber-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-900/5 sm:p-8">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 transition group-hover:bg-slate-950 group-hover:text-white">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <ellipse cx="12" cy="5" rx="8" ry="3" />
            <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
          </svg>
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
          02 / Engineering
        </p>

        <h3 className="mt-3 text-2xl font-extrabold text-slate-900">
          Backend & Tools
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Working with server-side development, version control,
          and application integrations.
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          {[
            "PHP",
            "Laravel",
            "REST APIs",
            "Git",
            "GitHub",
            "MySQL",
          ].map((skill) => (
            <span
              key={skill}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
            >
              {skill}
            </span>
          ))}
        </div>
      </article>

      {/* Cybersecurity */}
      <article className="group rounded-3xl border border-amber-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-900/5 sm:p-8">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 transition group-hover:bg-slate-950 group-hover:text-white">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
          03 / Security
        </p>

        <h3 className="mt-3 text-2xl font-extrabold text-slate-900">
          Cybersecurity
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Exploring network analysis, web security, and ethical
          penetration testing in authorized environments.
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          {[
            "Nmap",
            "Wireshark",
            "Burp Suite",
            "Gobuster",
            "Metasploit",
            "Linux",
          ].map((skill) => (
            <span
              key={skill}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
            >
              {skill}
            </span>
          ))}
        </div>
      </article>
    </div>

    {/* Bottom Note */}
    <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      <p className="text-sm text-slate-600">
        Focused on practical skills, continuous improvement, and meaningful projects.
      </p>
    </div>
  </div>
</section>

{/* Projects Section */}
<section
  id="projects"
  className="scroll-mt-8 bg-white px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
>
  <div className="mx-auto max-w-7xl">
    {/* Heading */}
    <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="mb-5 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-amber-700">
          <span className="h-px w-10 bg-amber-600" />
          Selected work
        </p>

        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Projects I've{" "}
          <span className="text-amber-700">Built.</span>
        </h2>

        <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
          A collection of digital experiences, practical applications,
          and creative projects shaped by curiosity and problem-solving.
        </p>
      </div>

      <p className="text-sm font-semibold text-slate-500">
        <span className="text-amber-700">05</span> projects showcased
      </p>
    </div>

    {/* Project Cards */}
    <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
      {/* Project 1 */}
      <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#fcfaf5] transition duration-300 hover:-translate-y-2 hover:border-amber-300 hover:shadow-xl hover:shadow-slate-900/5">
        <a
          href="https://explore-al-masjid-an-nabawi.vercel.app/"
          target="_blank"
          rel="noreferrer"
          aria-label="Visit Explore Al-Masjid An-Nabawi"
          className="relative block aspect-[16/10] overflow-hidden bg-amber-50"
        >
          <img
            src="/projects/masjid-nabawi.jpg"
            alt="Explore Al-Masjid An-Nabawi project preview"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-amber-800 backdrop-blur">
            Featured
          </span>
          <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition group-hover:bg-amber-500 group-hover:text-white">
            ↗
          </span>
        </a>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
            Islamic Education · Web Experience
          </p>
          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            Explore Al-Masjid An-Nabawi
          </h3>
          <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
            An interactive digital experience inspired by the Prophet's Mosque
            and Islamic learning.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Web Development", "Interactive UI"].map((tag) => (
              <span key={tag} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                {tag}
              </span>
            ))}
          </div>
          <a
            href="https://explore-al-masjid-an-nabawi.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition hover:text-amber-700"
          >
            Explore Project <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>

      {/* Project 2 */}
      <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#fcfaf5] transition duration-300 hover:-translate-y-2 hover:border-amber-300 hover:shadow-xl hover:shadow-slate-900/5">
        <a
          href="https://spendwise-expense-tracker-one.vercel.app/"
          target="_blank"
          rel="noreferrer"
          aria-label="Visit SpendWise"
          className="relative block aspect-[16/10] overflow-hidden bg-amber-50"
        >
          <img
            src="/projects/spendwise.jpg"
            alt="SpendWise project preview"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition group-hover:bg-amber-500 group-hover:text-white">
            ↗
          </span>
        </a>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
            Finance · Productivity
          </p>
          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            SpendWise
          </h3>
          <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
            An expense-tracking web application designed to make financial
            activity easier to organize and understand.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Web Application", "Finance"].map((tag) => (
              <span key={tag} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                {tag}
              </span>
            ))}
          </div>
          <a
            href="https://spendwise-expense-tracker-one.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition hover:text-amber-700"
          >
            Explore Project <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>

      {/* Project 3 */}
      <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#fcfaf5] transition duration-300 hover:-translate-y-2 hover:border-amber-300 hover:shadow-xl hover:shadow-slate-900/5">
        <a
          href="https://steganography-lab-five.vercel.app/"
          target="_blank"
          rel="noreferrer"
          aria-label="Visit Steganography Lab"
          className="relative block aspect-[16/10] overflow-hidden bg-amber-50"
        >
          <img
            src="/projects/steganography.jpg"
            alt="Steganography Lab project preview"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition group-hover:bg-amber-500 group-hover:text-white">
            ↗
          </span>
        </a>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
            Cybersecurity · Privacy
          </p>
          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            Steganography Lab
          </h3>
          <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
            A practical security project exploring the concept of concealing
            information within digital images.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Cybersecurity", "Information Hiding"].map((tag) => (
              <span key={tag} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                {tag}
              </span>
            ))}
          </div>
          <a
            href="https://steganography-lab-five.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition hover:text-amber-700"
          >
            Explore Project <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>

      {/* Project 4 */}
      <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#fcfaf5] transition duration-300 hover:-translate-y-2 hover:border-amber-300 hover:shadow-xl hover:shadow-slate-900/5">
        <a
          href="https://amagix-technologies.vercel.app/"
          target="_blank"
          rel="noreferrer"
          aria-label="Visit AMAGix Technologies"
          className="relative block aspect-[16/10] overflow-hidden bg-amber-50"
        >
          <img
            src="/projects/amagix.jpg"
            alt="AMAGix Technologies project preview"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition group-hover:bg-amber-500 group-hover:text-white">
            ↗
          </span>
        </a>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
            Business · Technology
          </p>
          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            AMAGix Technologies
          </h3>
          <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
            A technology-focused company website presenting its brand,
            digital services, and online presence.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Company Website", "Web Development"].map((tag) => (
              <span key={tag} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                {tag}
              </span>
            ))}
          </div>
          <a
            href="https://amagix-technologies.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition hover:text-amber-700"
          >
            Explore Project <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>

      {/* Project 5 */}
      <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#fcfaf5] transition duration-300 hover:-translate-y-2 hover:border-amber-300 hover:shadow-xl hover:shadow-slate-900/5">
        <a
          href="https://sudaiss001.github.io/Eid-Wishes/"
          target="_blank"
          rel="noreferrer"
          aria-label="Visit Eid Wishes"
          className="relative block aspect-[16/10] overflow-hidden bg-amber-50"
        >
          <img
            src="/projects/eid-wishes.jpg"
            alt="Eid Wishes project preview"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition group-hover:bg-amber-500 group-hover:text-white">
            ↗
          </span>
        </a>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
            Creative · Interactive
          </p>
          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            Eid Wishes
          </h3>
          <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
            A festive digital greeting experience created to share Eid
            messages through a personalized web interface.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Creative Development", "Web Design"].map((tag) => (
              <span key={tag} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                {tag}
              </span>
            ))}
          </div>
          <a
            href="https://sudaiss001.github.io/Eid-Wishes/"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition hover:text-amber-700"
          >
            Explore Project <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>

      {/* More projects */}
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-amber-300 bg-amber-50/60 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-amber-700 shadow-sm">
          {"</>"}
        </div>
        <h3 className="mt-5 text-xl font-extrabold text-slate-900">
          More in the works
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Always exploring ideas, building projects, and improving my craft.
        </p>
        <a
          href="https://github.com/Sudaiss001"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-600"
        >
          Visit GitHub <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>

    {/* Bottom CTA */}
    <div className="mt-16 flex flex-col items-center justify-between gap-5 rounded-3xl bg-slate-950 p-8 sm:flex-row sm:p-10">
      <div>
        <p className="text-sm font-semibold text-amber-400">
          Have an idea in mind?
        </p>
        <h3 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
          Let's build something meaningful.
        </h3>
      </div>
      <a
        href="#contact"
        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
      >
        Let's Talk <span aria-hidden="true">↗</span>
      </a>
    </div>
  </div>
</section>

      

{/* Certifications Section */}
<section
  id="certifications"
  className="scroll-mt-8 bg-[#fcfaf5] px-6 py-20 sm:px-10 lg:px-16 lg:py-24"
>
  {/*
    Update the details below whenever you have the exact
    certificate titles, providers, and certificate images.
  */}
  {(() => {
    const certificates = [
      {
        id: "cybersecurity",
        title: "Cyberstarter Nexus Bootcamp",
        category: "Cybersecurity",
        provider: "Cyberstarter Nexus",
        status: "Certificate received",
        description:
          "Cybersecurity bootcamp training focused on foundational security knowledge and practical learning.",
        certificateImage: "/certifications/cyberstarter-nexus.jpeg",
        certificateLink: "",
      },
      {
        id: "frontend",
        title: "Frontend Development",
        category: "Software Development",
        provider: "CyberMinds Tech",
        status: "Certificate received",
        description:
          "Frontend development training focused on building responsive interfaces and modern web experiences.",
        certificateImage: "/certifications/frontend-development.jpeg",
        certificateLink: "https://www.cybermindstech.com.ng/",
      },
      {
        id: "backend",
        title: "Backend Development",
        category: "Software Development",
        provider: "Add training provider",
        status: "Training completed",
        description:
          "",
        certificateImage: "",
        certificateLink: "",
      },
    ];

    return <CertificationContent certificates={certificates} />;
  })()}
</section>

      

<section
  id="contact"
  className="bg-[#fcfaf5] px-6 py-24 sm:px-10 lg:px-16"
>
  <div className="mx-auto max-w-7xl">
    {/* Heading */}
    <div className="mb-14 max-w-2xl">
      <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        Get in touch
      </span>

      <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
        Let&apos;s build something{" "}
        <span className="text-amber-600">meaningful.</span>
      </h2>

      <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
        Have a project, an idea, or an opportunity? Send me a message.
        I&apos;d be glad to hear from you.
      </p>
    </div>

    <div className="grid items-start gap-8 lg:grid-cols-5">
      {/* Contact form */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9 lg:col-span-3">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-950">
            Send me a message
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Fill in the details below and prepare your message.
          </p>
        </div>

        <form onSubmit={handleContactSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="contact-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                required
                maxLength={100}
                className="w-full rounded-xl border border-slate-200 bg-[#fcfaf5] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                maxLength={254}
                className="w-full rounded-xl border border-slate-200 bg-[#fcfaf5] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-subject"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Subject
            </label>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              placeholder="What would you like to discuss?"
              required
              maxLength={150}
              className="w-full rounded-xl border border-slate-200 bg-[#fcfaf5] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            />
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              placeholder="Tell me a little about your idea..."
              required
              minLength={10}
              maxLength={5000}
              className="w-full resize-y rounded-xl border border-slate-200 bg-[#fcfaf5] px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            />
            <p className="mt-2 text-xs text-slate-400">
              Please provide at least 10 characters.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-amber-500 px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSending ? "Sending..." : "Send"}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path
                d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {contactStatus && (
            <p
              role="status"
              aria-live="polite"
              className={`text-sm leading-6 ${
                contactStatus.type === "success"
                  ? "text-emerald-700"
                  : "text-red-600"
              }`}
            >
              {contactStatus.message}
            </p>
          )}

          <p className="text-xs leading-5 text-slate-500">
            Your message will be delivered directly to my inbox.
          </p>
        </form>
      </div>

      {/* Contact details */}
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-3xl bg-slate-950 p-7 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
            Contact Sudaiss
          </p>

          <h3 className="mt-4 text-2xl font-bold">
            Let&apos;s connect.
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            I&apos;m open to meaningful projects, collaboration, and
            conversations about software development and cybersecurity.
          </p>

          <a
            href="mailto:mustaphaabdulrahman811@gmail.com"
            className="mt-6 inline-block break-all font-medium text-amber-400 transition hover:text-amber-300"
          >
            mustaphaabdulrahman811@gmail.com
          </a>
        </div>

        <a
          href="https://www.linkedin.com/in/abdulrahman-mustapha-2370a43a9?utm_source=share_via&utm_content=profile&utm_medium=member_android"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-md"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
            in
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-slate-950">LinkedIn</span>
            <span className="mt-1 block text-sm text-slate-500">
              Connect professionally
            </span>
          </span>
          <span aria-hidden="true" className="text-slate-400 transition group-hover:text-amber-600">
            ↗
          </span>
        </a>

        <a
          href="https://wa.me/2349032915572"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-md"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.46 0 .09 5.36.08 11.96c0 2.1.55 4.15 1.59 5.96L0 24l6.24-1.64a11.96 11.96 0 0 0 5.81 1.48h.01c6.6 0 11.97-5.37 11.97-11.97a11.9 11.9 0 0 0-3.51-8.39ZM12.06 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.7.97.99-3.6-.24-.37a9.86 9.86 0 0 1-1.52-5.25c0-5.45 4.44-9.89 9.9-9.89a9.83 9.83 0 0 1 7 2.9 9.83 9.83 0 0 1 2.9 7c0 5.45-4.45 9.89-9.92 9.89Zm5.43-7.41c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.8-1.49-1.78-1.66-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.5 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-slate-950">WhatsApp</span>
            <span className="mt-1 block text-sm text-slate-500">
              Let&apos;s chat
            </span>
          </span>
          <span aria-hidden="true" className="text-slate-400 transition group-hover:text-amber-600">
            ↗
          </span>
        </a>

        <a
          href="https://github.com/Sudaiss001"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-md"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 1.7 2.62 1.21 3.26.92.1-.72.39-1.21.71-1.49-2.48-.28-5.09-1.24-5.09-5.53 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.08 1.14a10.7 10.7 0 0 1 5.6 0c2.14-1.44 3.08-1.14 3.08-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.3-2.62 5.25-5.12 5.52.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-slate-950">GitHub</span>
            <span className="mt-1 block text-sm text-slate-500">
              Explore my projects
            </span>
          </span>
          <span aria-hidden="true" className="text-slate-400 transition group-hover:text-amber-600">
            ↗
          </span>
        </a>
      </div>
    </div>

  </div>
</section>

{/* Footer */}
<footer className="mt-auto w-full bg-[#111827] px-6 pb-8 pt-20 text-white sm:px-10 sm:pb-10 sm:pt-24 lg:px-16">
  <div className="mx-auto max-w-7xl">
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      {/* Brand */}
      <div className="lg:col-span-2">
        <a
          href="#"
          className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight text-white"
        >
          Sudaiss<span className="text-amber-500">.</span>
          <span className="text-amber-500">👑</span>
        </a>

        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
          Software Developer, Cybersecurity Analyst, and Penetration Testing
          Practitioner passionate about building useful digital solutions and
          exploring secure technology.
        </p>

        <p className="mt-4 text-sm font-medium text-slate-200">
          Commit your effort. Trust the decree of Allah.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
          Quick Links
        </h3>
        <nav aria-label="Footer quick links" className="mt-4">
          <ul className="space-y-3 text-sm">
            {[
              { label: "Home", href: "#" },
              { label: "About", href: "#about" },
              { label: "Skills", href: "#skills" },
              { label: "Projects", href: "#projects" },
              { label: "Certifications", href: "#certifications" },
              { label: "Contact", href: "#contact" },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-block text-slate-300 transition hover:translate-x-1 hover:text-amber-400"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Connect */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
          Connect
        </h3>
        <ul className="mt-4 space-y-3 text-sm">
          <li>
            <a
              href="mailto:mustaphaabdulrahman811@gmail.com"
              className="text-slate-300 transition hover:text-amber-400"
            >
              Email Me
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/abdulrahman-mustapha-2370a43a9?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 transition hover:text-amber-400"
            >
              LinkedIn ↗
            </a>
          </li>
          <li>
            <a
              href="https://wa.me/2349032915572"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 transition hover:text-amber-400"
            >
              WhatsApp ↗
            </a>
          </li>
          <li>
            <a
              href="https://github.com/Sudaiss001"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 transition hover:text-amber-400"
            >
              GitHub ↗
            </a>
          </li>
        </ul>
      </div>
    </div>

    {/* Copyright */}
    <div className="mt-10 flex flex-col gap-3 border-t border-slate-700 py-6 text-center text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">
      <p>© {new Date().getFullYear()} Sudaiss. All rights reserved.</p>

      <a
        href="#"
        className="font-semibold text-slate-300 transition hover:text-amber-400"
      >
        Back to top ↑
      </a>

      <p>Built with purpose. Sudaiss 👑</p>
    </div>
  </div>
</footer>

      <VoiceAssistant />
</main>

)
}

export default App