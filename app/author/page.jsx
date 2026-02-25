import Link from 'next/link'
import EmailLink from '@/components/EmailLink'

const siteUrl = 'https://mharomo.systems'

export const metadata = {
  title: 'Author - Mharomo Ezung',
  description: 'Learn about Mharomo Ezung, the creator behind Mharomo.systems and its AI tools for chat, images, video, music, and speech.',
  alternates: {
    canonical: `${siteUrl}/author`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Author - Mharomo Ezung',
    description: 'Creator of Mharomo.systems and its AI tools for chat, images, video, music, and speech.',
    url: `${siteUrl}/author`,
    siteName: 'Mharomo.systems',
    type: 'profile',
  },
  twitter: {
    card: 'summary',
    title: 'Author - Mharomo Ezung',
    description: 'Creator of Mharomo.systems and its AI tools for chat, images, video, music, and speech.',
  },
}

export default function AuthorPage() {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Mharomo Ezung',
    url: `${siteUrl}/author`,
    jobTitle: 'Software Developer',
    email: 'mailto:mharomolotha6@gmail.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Delhi',
      addressCountry: 'India',
    },
    worksFor: {
      '@type': 'Organization',
      name: 'Mharomo.systems',
      url: siteUrl,
    },
    sameAs: [
      'https://linkedin.com/in/mharomo-ezung-51b158191',
      'https://github.com/Mharomoincpass',
    ],
  }

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Author - Mharomo Ezung',
    url: `${siteUrl}/author`,
    description: 'Author profile for Mharomo Ezung, creator of Mharomo.systems.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Author',
          item: `${siteUrl}/author`,
        },
      ],
    },
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <Link href="/" className="text-xs text-zinc-600 hover:text-black transition-colors">
          Back to Home
        </Link>

        <div className="mt-8 flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-full bg-zinc-200 flex items-center justify-center text-2xl font-bold text-zinc-700">
            M
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Mharomo Ezung</h1>
            <p className="text-sm text-zinc-600 mt-2">Software Developer</p>
            <p className="text-xs text-zinc-500 mt-1">Delhi, India</p>
            <p EmailLink email="mharomolotha6@gmail.com" className="underline hover:text-black" /
              <a className="underline hover:text-black" href="mailto:mharomolotha6@gmail.com">mharomolotha6@gmail.com</a>
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <a className="text-zinc-700 hover:text-black underline" href="https://linkedin.com/in/mharomo-ezung-51b158191" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <a className="text-zinc-700 hover:text-black underline" href="https://github.com/Mharomoincpass" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <Link className="text-zinc-700 hover:text-black underline" href="/blogs">
                Read the Blog
              </Link>
            </div>
          </div>
        </div>

        <section className="mt-10 space-y-4 text-zinc-700">
          <h2 className="text-2xl font-bold text-black">Summary</h2>
          <p>
            Full-stack developer and technical lead with expertise in building and scaling web applications, cloud
            infrastructure, and machine learning microservices. Skilled in Node.js, React.js, Next.js, CodeIgniter 3,
            AWS EC2, Google Cloud Run, Azure, and Vertex AI, with hands-on experience designing robust, maintainable
            software solutions and mentoring teams to deliver impactful projects.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-zinc-700">
          <h2 className="text-2xl font-bold text-black">Technical Skills</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Backend: Node.js, CodeIgniter, Python</li>
            <li>Database: MariaDB, MongoDB</li>
            <li>Frontend: React.js, Next.js, HTML, CSS, JavaScript</li>
            <li>Cloud: AWS, Google Cloud, Azure, E2E Networks</li>
            <li>DevOps: Linux VM, Docker, container deployment, GitHub CI/CD</li>
            <li>Data Analytics: Python, Hugging Face ML, Vertex AI, NLP</li>
            <li>Version Control: Git</li>
            <li>AI: Vertex AI, Gemini, Azure AI Foundry</li>
          </ul>
        </section>

        <section className="mt-10 space-y-4 text-zinc-700">
          <h2 className="text-2xl font-bold text-black">Experience</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-black">Tech Lead, Grocliq - Gurugram, IN</h3>
              <p className="text-xs text-zinc-500 mt-1">Jan 2025 - Present</p>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li>Leading a team to design and deliver scalable web applications using Node.js and React.js.</li>
                <li>Developed ML microservices using Python, Hugging Face models, and NLP toolkits.</li>
                <li>Architected high-performance backend services deployed on Google Cloud Run.</li>
                <li>Integrated Vertex AI for real-time predictions and serverless scaling.</li>
                <li>Mentored engineers and optimized delivery workflows with GitHub.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black">Software Developer, OnDemand International LLP - Gurgaon, IN</h3>
              <p className="text-xs text-zinc-500 mt-1">Aug 2024 - Dec 2024</p>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li>Maintained and enhanced CodeIgniter 3 systems optimized for E2E integration.</li>
                <li>Designed and implemented new modules to boost system scalability.</li>
                <li>Managed AWS EC2 servers and tuned MariaDB queries for performance.</li>
                <li>Led migration to E2E Networks and improved system reliability.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-4 text-zinc-700">
          <h2 className="text-2xl font-bold text-black">Education</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>MSc, Data Science and Analytics - Sharda University, Noida, IN</li>
            <li>BSc, Computer Science - Kohima Science College, Nagaland, IN</li>
          </ul>
        </section>

        <section className="mt-10 space-y-4 text-zinc-700">
          <h2 className="text-2xl font-bold text-black">Work and Products</h2>
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-black">Incpass - Business Management Platform</h3>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Designed a CodeIgniter 3 system with four portals for compliance and incorporation workflows.</li>
                <li>Optimized queries and backend architecture to reduce load times by 30 percent.</li>
                <li>Integrated document generation, secure authentication, and automated compliance reminders.</li>
                <li>Used in production on OnDemandInternational.com, generating 1 Cr+ monthly revenue.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black">Grocliq GEO - Generative Engine Optimization Platform</h3>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Built a monitoring platform for AI search visibility across models and generative systems.</li>
                <li>Developed real-time dashboards for brand mentions, sentiment, and competitor activity.</li>
                <li>Created Python microservices for embeddings and ABV scoring with Vertex AI.</li>
                <li>Deployed pipelines on Google Cloud Run and delivered interactive analytics visuals.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black">OpenSignals.ai - Competitor Ad Intelligence</h3>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Built an ads scraper and AI classification pipeline for Meta Ad Library data.</li>
                <li>Integrated image and video generation pipelines for ad creative testing.</li>
                <li>Enabled direct campaign creation and tracking with Meta Ads Manager integration.</li>
                <li>Delivered scheduled scraping and dashboard updates for competitive insights.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
