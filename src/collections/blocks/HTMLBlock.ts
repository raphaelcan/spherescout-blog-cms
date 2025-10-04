import type { Block } from 'payload'

export const HTMLBlock: Block = {
  slug: 'html',
  labels: {
    singular: 'HTML Block',
    plural: 'HTML Blocks',
  },
  fields: [
    {
      name: 'html',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Custom HTML content. Use with caution.',
        rows: 10,
      },
    },
  ],
}