import { gcsStorage } from '@payloadcms/storage-gcs'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor, EXPERIMENTAL_TableFeature, BlocksFeature } from '@payloadcms/richtext-lexical'
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
import { HTMLBlock } from './collections/blocks/HTMLBlock'
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
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      EXPERIMENTAL_TableFeature(),
      BlocksFeature({
        blocks: [HTMLBlock],
      }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      ssl: { rejectUnauthorized: true,     ca: process.env.SUPABASE_CA_CERT?.replace(/\\n/g, '\n')
},

    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    gcsStorage({
      bucket: process.env.GCS_BUCKET || 'spherescout-cms-media',
      options: {
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        credentials: {
          client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
      },
      collections: {
        media: {
          generateFileURL: ({ filename }) => {
            return `https://storage.googleapis.com/${process.env.GCS_BUCKET || 'spherescout-cms-media'}/${filename}`
          },
        },
      },
    }),
  ],
})
