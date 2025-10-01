// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'
import { Tags } from './collections/Tags'
import { Authors } from './collections/Authors'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Posts, Categories, Tags, Authors],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
  hooks: {
    afterChange: [
      {
        collection: 'posts',
        hook: async ({ doc, operation }) => {
          // Only trigger webhook for published posts
          if (doc.status === 'published') {
            try {
              await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate?secret=${process.env.REVALIDATION_SECRET}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  type: `post.${operation}`,
                  slug: doc.slug,
                }),
              })
            } catch (error) {
              console.error('Failed to revalidate:', error)
            }
          }
        },
      },
    ],
  },
})
