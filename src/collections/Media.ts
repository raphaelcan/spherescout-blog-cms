import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'enableWebP',
      type: 'checkbox',
      label: 'Convert to WebP',
      defaultValue: true,
      admin: {
        description: 'Automatically convert uploaded images to WebP format for better compression',
      },
    },
  ],
  upload: {
    formatOptions: {
      format: 'webp',
      options: {
        quality: 100,
        lossless: true,
      },
    },
  },
}
