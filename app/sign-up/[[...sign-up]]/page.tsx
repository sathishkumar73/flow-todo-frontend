export const dynamic = "force-dynamic";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#07070F",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <span
          style={{
            fontSize: "22px",
            fontWeight: 700,
            background: "linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px",
          }}
        >
          Flow Todo
        </span>
        <p
          style={{
            color: "rgba(232,232,240,0.5)",
            fontSize: "14px",
            marginTop: "6px",
          }}
        >
          Create your account to get started
        </p>
      </div>
      <SignUp />
    </div>
  );
}
