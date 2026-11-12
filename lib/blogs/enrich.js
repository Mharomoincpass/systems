import { extrasBySlug } from "./extras";

/**
 * Merge FAQs, extra detailed sections, and link metadata onto a base post.
 */
export function enrichPost(post) {
  if (!post) return null;
  const extra = extrasBySlug[post.slug];
  if (!extra) {
    return {
      ...post,
      faqs: post.faqs || [],
      relatedSlugs: post.relatedSlugs || [],
      externalLinks: post.externalLinks || [],
    };
  }

  return {
    ...post,
    readingMinutes: extra.readingMinutes || post.readingMinutes,
    updatedAt: post.updatedAt || post.publishedAt,
    sections: [...post.sections, ...(extra.extraSections || [])],
    faqs: extra.faqs || post.faqs || [],
    relatedSlugs: extra.relatedSlugs || post.relatedSlugs || [],
    externalLinks: extra.externalLinks || post.externalLinks || [],
  };
}
