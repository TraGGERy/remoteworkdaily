import { permanentRedirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://remoteworkdaily.com/privacy-policy",
  },
};

export default function PrivacyRedirectPage() {
  permanentRedirect("/privacy-policy");
}
