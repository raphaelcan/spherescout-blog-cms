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

        // Replace spaces with hyphens in filename
        if (file.name) {
          file.name = file.name.replace(/\s+/g, '-')
        }

        const isGIF =
          file.mimetype === 'image/gif' ||
          file.name?.toLowerCase().endsWith('.gif')

        if (isGIF) {
          // Store original MIME type in req context
          if (!req.context) req.context = {}
          req.context.originalMimeType = file.mimetype
          // Temporarily change MIME type to prevent WebP conversion
          file.mimetype = 'application/octet-stream'
        }
      },
    ],
    beforeChange: [
      ({ data, req }) => {
        const file = req?.file
        if (file?.name?.toLowerCase().endsWith('.gif')) {
          data.enableWebP = false
          // Restore original MIME type for proper storage
          const originalMimeType = req?.context?.originalMimeType
          if (originalMimeType) {
            data.mimeType = originalMimeType
          } else {
            data.mimeType = 'image/gif'
          }
        }
        return data
      },
    ],
  },
}
