import { getAllPosts } from "@/lib/blogs/posts";
import { getAllServicePages } from "@/lib/services/pages";

const SITE = "https://mharomo.systems";

export default function sitemap() {
  const posts = getAllPosts().map((post) => ({
    url: `${SITE}/blogs/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const services = getAllServicePages().map((page) => ({
    url: `${SITE}/services/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.95,
  }));

  return [
    {
      url: `${SITE}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE}/services`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.95,
    },
    ...services,
    {
      url: `${SITE}/blogs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...posts,
    {
      url: `${SITE}/studio`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE}/studio/voice`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
