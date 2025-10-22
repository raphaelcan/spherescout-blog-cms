import type { CollectionConfig } from 'payload'
import { optimizeGif } from '../utils/gifOptimizer'

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
      async ({ req, operation }) => {
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
          console.log(`Uploading GIF: ${file.name} (${Math.round(file.size / 1024)}KB)`)

          try {
            // Optimize GIF before processing
            const optimizedBuffer = await optimizeGif(file.data)
            file.data = optimizedBuffer
            file.size = optimizedBuffer.length
          } catch (error) {
            console.error('GIF optimization failed:', error)
            // Continue with original file if optimization fails
          }

          // Store original MIME type in req context
          if (!req.context) req.context = {}
          req.context.originalMimeType = file.mimetype

          // Always keep as GIF, prevent WebP conversion
          file.mimetype = 'application/octet-stream'
        }
      },
    ],
    beforeChange: [
      ({ data, req }) => {
        const file = req?.file
        const originalMimeType = req?.context?.originalMimeType

        if (originalMimeType === 'image/gif') {
          // Keep as optimized GIF, disable WebP conversion
          data.enableWebP = false
          data.mimeType = 'image/gif'
        }
        return data
      },
    ],
  },
}
