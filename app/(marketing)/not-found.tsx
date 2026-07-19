import Link from "next/link";

const ink = "#E8E8F0";
const ink3 = "rgba(232,232,240,0.38)";

export default function NotFound() {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
      style={{ background: "#07070F" }}
    >
      <p
        className="text-[80px] font-bold leading-none mb-4"
        style={{
          background: "linear-gradient(135deg,#60A5FA,#A78BFA)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        404
      </p>
      <h1 className="text-2xl font-semibold mb-2" style={{ color: ink }}>
        Page not found
      </h1>
      <p className="text-sm mb-8 max-w-sm" style={{ color: ink3 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition"
          style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)" }}
        >
          Go home
        </Link>
        <Link
          href="/blog"
          className="rounded-xl border px-5 py-2.5 text-sm font-medium transition"
          style={{
            borderColor: "rgba(255,255,255,0.1)",
            color: ink3,
          }}
        >
          Browse blog
        </Link>
      </div>
    </div>
  );
}
