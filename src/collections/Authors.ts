import type { CollectionConfig } from 'payload'

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly version of the author name',
      },
    },
    {
      name: 'bio',
      type: 'richText',
      admin: {
        description: 'Author biography',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Author profile picture',
      },
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Author website URL',
      },
    },
    {
      name: 'social',
      type: 'group',
      fields: [
        {
          name: 'twitter',
          type: 'text',
          admin: {
            description: 'Twitter handle (without @)',
          },
        },
        {
          name: 'linkedin',
          type: 'text',
          admin: {
            description: 'LinkedIn profile URL',
          },
        },
        {
          name: 'github',
          type: 'text',
          admin: {
            description: 'GitHub username',
          },
        },
      ],
    },
  ],
}