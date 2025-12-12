import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Vigee Docs',
  description: 'Documentation technique Vigee',
  lang: 'fr-FR',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: false,

    nav: [
      { text: 'Accueil', link: '/' },
      { text: 'Guides', link: '/guides/getting-started' },
      { text: 'Architecture', link: '/architecture/monorepo-setup' },
      { text: 'API', link: '/api/endpoints' },
      { text: 'Emails', link: '/mails-templates/' }
    ],

    sidebar: {
      '/guides/': [
        {
          text: 'Guides',
          items: [
            { text: 'Démarrage rapide', link: '/guides/getting-started' },
            { text: 'Monorepo Setup', link: '/guides/monorepo-setup' },
            { text: 'Setup Laravel + Next.js', link: '/guides/laravel-next-setup' },
            { text: 'pnpm Workspace', link: '/guides/pnpm-workspace' },
            { text: 'GitHub Actions - Init serveur', link: '/guides/github-actions-init' },
            { text: 'Documentation API (Scribe)', link: '/guides/scribe-documentation' },
            { text: 'Déploiement', link: '/guides/deployment' }
          ]
        }
      ],
      '/architecture/': [
        {
          text: 'Architecture',
          items: [
            { text: 'Setup Monorepo', link: '/architecture/monorepo-setup' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API',
          items: [
            { text: 'Endpoints', link: '/api/endpoints' }
          ]
        }
      ],
      '/conventions/': [
        {
          text: 'Conventions',
          items: [
            { text: 'Standards de code', link: '/conventions/coding-standards' },
            { text: 'Workflow Git', link: '/conventions/git-workflow' }
          ]
        }
      ],
      '/troubleshooting/': [
        {
          text: 'Dépannage',
          items: [
            { text: 'Problèmes courants', link: '/troubleshooting/common-issues' }
          ]
        }
      ],
      '/mails-templates/': [
        {
          text: 'Templates d\'emails',
          items: [
            { text: 'Vue d\'ensemble', link: '/mails-templates/' }
          ]
        },
        {
          text: 'Livraisons & Développements',
          items: [
            { text: 'Livraison vidéo', link: '/mails-templates/livraison-video' },
            { text: 'Suivi développements', link: '/mails-templates/suivi-developpements' },
            { text: 'PV de livraison', link: '/mails-templates/pv-livraison' }
          ]
        },
        {
          text: 'Contrats & Facturation',
          items: [
            { text: 'Maintenance annuelle', link: '/mails-templates/maintenance-annuelle' },
            { text: 'Révision tarifs', link: '/mails-templates/revision-tarifs' }
          ]
        },
        {
          text: 'Technique & Configuration',
          items: [
            { text: 'GitHub + Bucket S3', link: '/mails-templates/github-bucket-s3' },
            { text: 'Certifications ISO', link: '/mails-templates/certifications-iso' }
          ]
        },
        {
          text: 'Relation client',
          items: [
            { text: 'Demande d\'avis Google', link: '/mails-templates/avis-google' },
            { text: 'Mise en relation CII', link: '/mails-templates/mise-en-relation-cii' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vigee-dev/vigee-docs' }
    ],

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: 'Sur cette page'
    },

    docFooter: {
      prev: 'Page précédente',
      next: 'Page suivante'
    },

    lastUpdated: {
      text: 'Dernière mise à jour'
    },

    editLink: {
      pattern: 'https://github.com/vigee-dev/vigee-docs/edit/main/docs/:path',
      text: 'Modifier cette page sur GitHub'
    }
  },

  markdown: {
    lineNumbers: true
  }
})
