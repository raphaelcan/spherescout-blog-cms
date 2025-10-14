import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'filename',
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
    },
  ],
  upload: {
    formatOptions: {
      format: 'webp',
      options: { quality: 85 },
    },
  },
  hooks: {
    beforeOperation: [
      ({ req, operation }) => {
        if (operation !== 'create') return
        const file = req?.file
        if (!file) return

        const isGIF =
          file.mimetype === 'image/gif' ||
          file.name?.toLowerCase().endsWith('.gif')

        if (isGIF) {
          // 🧠 Trick Payload: tell it this is not an image
          file.mimetype = 'application/octet-stream'
        }
      },
    ],
    beforeChange: [
      ({ data, req }) => {
        if (req?.file?.name?.toLowerCase().endsWith('.gif')) {
          data.enableWebP = false
        }
        return data
      },
    ],
  },
}
