import LandingNav from "@/components/marketing/LandingNav";
import Footer from "@/components/marketing/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#07070F", minHeight: "100vh", color: "#E8E8F0" }}>
      <LandingNav />
      {children}
      <Footer />
    </div>
  );
}
