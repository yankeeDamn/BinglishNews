import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const pages: Record<string, { title: string; sections: { heading: string; text: string }[] }> = {
  about: { title: "About BinglishNews", sections: [
    { heading: "What we do", text: "BinglishNews brings together international headlines linking to their original publishers and provides a place for community stories reviewed before publication." },
    { heading: "Our focus", text: "We aim to make world events and technology easier to discover. Aggregated headlines are attributed to their sources; community stories are published on this site." },
  ] },
  contact: { title: "Contact us", sections: [
    { heading: "News and feedback", text: "Contact the publisher with questions, feedback, source concerns, or requests to correct a story. Include the article link and details so the issue can be reviewed." },
  ] },
  "editorial-policy": { title: "Editorial policy", sections: [
    { heading: "Sources and accuracy", text: "Contributors should provide reliable sources, distinguish fact from opinion, and check claims before submission. Editors review community submissions before publication. Aggregated headlines link to the original publishers." },
    { heading: "Images and attribution", text: "Contributors should use only images they have permission to publish and provide appropriate credit. Third-party content and images remain subject to their owners’ rights and applicable terms." },
    { heading: "Corrections", text: "Readers can report errors using the contact page. We review reports and aim to correct substantive errors transparently." },
  ] },
  corrections: { title: "Corrections", sections: [
    { heading: "Report an error", text: "Please include the article URL, the information you believe is wrong, and a reliable source supporting your correction." },
    { heading: "Our approach", text: "We review requests and, where a substantive correction is needed, aim to update the story and explain the change. For an article on another publisher’s site, please contact that publisher directly as well." },
  ] },
  privacy: { title: "Privacy", sections: [
    { heading: "Information used by the site", text: "The site uses Firebase services for accounts, community posts and uploaded images. If you submit a post, the information you provide may be processed for review and, if approved, published. Browser storage is used for preferences and saved articles." },
    { heading: "Analytics", text: "If analytics is configured, it is optional and starts only after you choose to allow it. You can change your choice using Analytics settings in the footer. Google Analytics may collect usage data and use cookies when enabled." },
    { heading: "Third-party services", text: "The site retrieves news from external providers and may display images hosted by third parties. When you visit a linked publisher, that publisher’s privacy practices apply." },
    { heading: "Questions", text: "For privacy questions or requests, use the contact page. This notice should be reviewed and updated by the publisher to reflect the services actually configured and applicable requirements." },
  ] },
  terms: { title: "Terms of use", sections: [
    { heading: "Using BinglishNews", text: "News is provided for general information. Check the original source for details and updates. External websites have their own terms and policies." },
    { heading: "Contributions", text: "Submit only material you have the right to share. Do not submit misleading, unlawful or abusive content. Submissions may be reviewed, rejected or removed." },
    { heading: "Third-party content", text: "Headlines, links and images from other publishers belong to their respective owners. These terms should be reviewed by the publisher before commercial launch." },
  ] },
};

type Props = { params: Promise<{ information: string }> };
export function generateStaticParams() { return Object.keys(pages).map((information) => ({ information })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { information } = await params; return { title: pages[information]?.title || "Page not found" }; }
export default async function InformationPage({ params }: Props) {
  const { information } = await params;
  const page = pages[information];
  if (!page) notFound();
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  const safeEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;
  return <article className="mx-auto max-w-3xl px-4 py-12"><h1 className="font-serif text-4xl font-semibold">{page.title}</h1>
    {page.sections.map((section) => <section key={section.heading} className="mt-8"><h2 className="font-serif text-2xl font-semibold">{section.heading}</h2><p className="mt-3 leading-relaxed text-muted">{section.text}</p></section>)}
    {information === "contact" && (safeEmail ? <p className="mt-6">Email: <a className="underline" href={`mailto:${safeEmail}`}>{safeEmail}</a></p> : <p className="mt-6 text-muted">The publisher has not yet configured a contact email.</p>)}
    {information !== "contact" && <p className="mt-8"><Link href="/contact" className="underline">Contact us</Link></p>}
  </article>;
}
