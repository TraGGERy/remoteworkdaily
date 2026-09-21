import { Metadata } from "next";
import { JobPostForm } from "@/components/post-job/job-post-form";

export const metadata: Metadata = {
  title: "Post a Remote Job | Reach 2,500,000+ Remote Workers",
  description: "Hire the best remote engineers, designers, product managers, and leaders. Post your remote job on the #1 remote work platform with #OpenSalaries.",
};

export default function HireRemotelyPage() {
  return (
    <div className="min-h-screen bg-neutral-50/60 dark:bg-neutral-950 py-6">
      <JobPostForm />
    </div>
  );
}
