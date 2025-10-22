import type { CollectionConfig } from 'payload'

type PostFormData = {
  seo?: {
    jsonSchema?: {
      enabled?: boolean
    }
    howTo?: {
      enabled?: boolean
    }
  }
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'language', 'author', 'category', 'status', 'publishedDate', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      // In admin, show all posts (including drafts)
      if (user) return true
      // For public API, only show published posts
      return {
        status: {
          equals: 'published',
        },
      }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly version of the title (e.g., "my-blog-post")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Brief summary of the post for previews and SEO',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'language',
      type: 'select',
      options: [
        {
          label: 'English',
          value: 'en',
        },
        {
          label: 'French',
          value: 'fr',
        },
      ],
      defaultValue: 'en',
      required: true,
      admin: {
        description: 'Language of the post content',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Main image for the post',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Published',
          value: 'published',
        },
        {
          label: 'Scheduled',
          value: 'scheduled',
        },
      ],
      defaultValue: 'draft',
      required: true,
    },
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        description: 'When the post should be published. Required for published and scheduled posts.',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      hooks: {
        beforeChange: [
          ({ data, value }) => {
            // Auto-set published date to current time if not provided for published posts
            if (data?.status === 'published' && !value) {
              return new Date().toISOString()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO & Schema',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: {
            description: 'SEO title (if different from post title)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          admin: {
            description: 'SEO description for search engines',
          },
        },
        {
          name: 'metaKeywords',
          type: 'text',
          admin: {
            description: 'Comma-separated keywords for SEO',
          },
        },
        {
          name: 'metaImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Image for social media sharing (1200x630px recommended)',
          },
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          admin: {
            description: 'Canonical URL if this post exists elsewhere',
          },
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          admin: {
            description: 'Prevent search engines from indexing this post',
          },
        },
        {
          name: 'noFollow',
          type: 'checkbox',
          admin: {
            description: 'Prevent search engines from following links in this post',
          },
        },
        {
          name: 'openGraph',
          type: 'group',
          label: 'Open Graph (Facebook)',
          fields: [
            {
              name: 'title',
              type: 'text',
              admin: {
                description: 'Open Graph title (if different from meta title)',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description: 'Open Graph description (if different from meta description)',
              },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Open Graph image (1200x630px recommended)',
              },
            },
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'Article', value: 'article' },
                { label: 'Website', value: 'website' },
                { label: 'Blog', value: 'blog' },
              ],
              defaultValue: 'article',
            },
          ],
        },
        {
          name: 'twitter',
          type: 'group',
          label: 'Twitter Card',
          fields: [
            {
              name: 'card',
              type: 'select',
              options: [
                { label: 'Summary', value: 'summary' },
                { label: 'Summary Large Image', value: 'summary_large_image' },
                { label: 'App', value: 'app' },
                { label: 'Player', value: 'player' },
              ],
              defaultValue: 'summary_large_image',
            },
            {
              name: 'title',
              type: 'text',
              admin: {
                description: 'Twitter card title (if different from meta title)',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description: 'Twitter card description (if different from meta description)',
              },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Twitter card image (1200x630px for large image)',
              },
            },
            {
              name: 'creator',
              type: 'text',
              admin: {
                description: 'Twitter handle of content creator (with @)',
              },
            },
            {
              name: 'site',
              type: 'text',
              admin: {
                description: 'Twitter handle of website (with @)',
              },
            },
          ],
        },
        {
          name: 'jsonSchema',
          type: 'group',
          label: 'JSON-LD Schema',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Enable JSON-LD structured data for this post',
              },
            },
            {
              name: 'schemaType',
              type: 'select',
              options: [
                { label: 'Article', value: 'Article' },
                { label: 'BlogPosting', value: 'BlogPosting' },
                { label: 'NewsArticle', value: 'NewsArticle' },
                { label: 'TechArticle', value: 'TechArticle' },
                { label: 'ScholarlyArticle', value: 'ScholarlyArticle' },
              ],
              defaultValue: 'BlogPosting',
              admin: {
                condition: (data: PostFormData) => Boolean(data.seo?.jsonSchema?.enabled),
              },
            },
            {
              name: 'headline',
              type: 'text',
              admin: {
                description: 'Article headline (if different from title)',
                condition: (data: PostFormData) => Boolean(data.seo?.jsonSchema?.enabled),
              },
            },
            {
              name: 'alternativeHeadline',
              type: 'text',
              admin: {
                description: 'Alternative or subtitle',
                condition: (data: PostFormData) => Boolean(data.seo?.jsonSchema?.enabled),
              },
            },
            {
              name: 'wordCount',
              type: 'number',
              admin: {
                description: 'Article word count (auto-calculated if left empty)',
                condition: (data: PostFormData) => Boolean(data.seo?.jsonSchema?.enabled),
              },
            },
            {
              name: 'timeToRead',
              type: 'text',
              admin: {
                description: 'Estimated reading time (e.g., "PT5M" for 5 minutes)',
                condition: (data: PostFormData) => Boolean(data.seo?.jsonSchema?.enabled),
              },
            },
            {
              name: 'articleSection',
              type: 'text',
              admin: {
                description: 'Section or category of the article',
                condition: (data: PostFormData) => Boolean(data.seo?.jsonSchema?.enabled),
              },
            },
            {
              name: 'keywords',
              type: 'text',
              admin: {
                description: 'Comma-separated keywords for schema',
                condition: (data: PostFormData) => Boolean(data.seo?.jsonSchema?.enabled),
              },
            },
            {
              name: 'publisher',
              type: 'group',
              label: 'Publisher Information',
              admin: {
                condition: (data: PostFormData) => Boolean(data.seo?.jsonSchema?.enabled),
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  admin: {
                    description: 'Publisher name (e.g., your company name)',
                  },
                },
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Publisher logo (recommended: 600x60px)',
                  },
                },
                {
                  name: 'url',
                  type: 'text',
                  admin: {
                    description: 'Publisher website URL',
                  },
                },
              ],
            },
            {
              name: 'mainEntityOfPage',
              type: 'text',
              admin: {
                description: 'URL of the main entity page (usually the post URL)',
                condition: (data: PostFormData) => Boolean(data.seo?.jsonSchema?.enabled),
              },
            },
            {
              name: 'isAccessibleForFree',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Is this content free to access?',
                condition: (data: PostFormData) => Boolean(data.seo?.jsonSchema?.enabled),
              },
            },
            {
              name: 'isPartOf',
              type: 'group',
              label: 'Part of Publication',
              admin: {
                condition: (data: PostFormData) => Boolean(data.seo?.jsonSchema?.enabled),
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  admin: {
                    description: 'Name of the publication/blog',
                  },
                },
                {
                  name: 'issn',
                  type: 'text',
                  admin: {
                    description: 'ISSN number if applicable',
                  },
                },
              ],
            },
            {
              name: 'customSchema',
              type: 'code',
              admin: {
                language: 'json',
                description: 'Custom JSON-LD schema (will be merged with auto-generated schema)',
                condition: (data: PostFormData) => Boolean(data.seo?.jsonSchema?.enabled),
              },
            },
          ],
        },
        {
          name: 'breadcrumbs',
          type: 'array',
          label: 'Breadcrumb Schema',
          admin: {
            description: 'Define breadcrumb structure for rich snippets',
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'faq',
          type: 'array',
          label: 'FAQ Schema',
          admin: {
            description: 'Add FAQ items for rich snippets in search results',
          },
          fields: [
            {
              name: 'question',
              type: 'text',
              required: true,
            },
            {
              name: 'answer',
              type: 'richText',
              required: true,
            },
          ],
        },
        {
          name: 'howTo',
          type: 'group',
          label: 'How-To Schema',
          admin: {
            description: 'For tutorial/how-to articles',
          },
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              admin: {
                description: 'Enable How-To structured data',
              },
            },
            {
              name: 'name',
              type: 'text',
              admin: {
                description: 'Name of the how-to guide',
                condition: (data: PostFormData) => Boolean(data.seo?.howTo?.enabled),
              },
            },
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description: 'Description of what the guide accomplishes',
                condition: (data: PostFormData) => Boolean(data.seo?.howTo?.enabled),
              },
            },
            {
              name: 'totalTime',
              type: 'text',
              admin: {
                description: 'Total time needed (e.g., "PT30M" for 30 minutes)',
                condition: (data: PostFormData) => Boolean(data.seo?.howTo?.enabled),
              },
            },
            {
              name: 'estimatedCost',
              type: 'text',
              admin: {
                description: 'Estimated cost with currency (e.g., "USD 50")',
                condition: (data: PostFormData) => Boolean(data.seo?.howTo?.enabled),
              },
            },
            {
              name: 'supply',
              type: 'array',
              admin: {
                description: 'Required supplies/materials',
                condition: (data: PostFormData) => Boolean(data.seo?.howTo?.enabled),
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'tool',
              type: 'array',
              admin: {
                description: 'Required tools',
                condition: (data: PostFormData) => Boolean(data.seo?.howTo?.enabled),
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'step',
              type: 'array',
              admin: {
                description: 'How-to steps',
                condition: (data: PostFormData) => Boolean(data.seo?.howTo?.enabled),
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'text',
                  type: 'richText',
                  required: true,
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'url',
                  type: 'text',
                  admin: {
                    description: 'URL to detailed instructions for this step',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  versions: {
    drafts: true,
  },
}