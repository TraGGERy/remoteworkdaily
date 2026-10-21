import { permanentRedirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://remoteworkdaily.com/terms-and-conditions",
  },
};

export default function TermsRedirectPage() {
  permanentRedirect("/terms-and-conditions");
}
