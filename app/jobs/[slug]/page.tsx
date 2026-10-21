import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getJobBySlug, getJobById } from "@/lib/jobs-repository";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkdaily.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobBySlug(slug) || getJobById(slug);
  if (!job) return { title: "Job Not Found | Remote Work Daily" };

  const canonicalUrl = `${SITE_URL}/jobs/${job.id}/${job.slug || slug}`;

  return {
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function JobDetailSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const job = getJobBySlug(slug) || getJobById(slug);

  if (!job) {
    notFound();
  }

  permanentRedirect(`/jobs/${job.id}/${job.slug || slug}`);
}
