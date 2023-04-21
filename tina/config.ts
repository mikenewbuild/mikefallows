import { defineConfig } from "tinacms";
import { blog_postFields } from "./templates";
import { simple_pageFields } from "./templates";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  clientId: `${process.env.TINA_CLIENT_ID}`, // Get this from tina.io
  token: `${process.env.TINA_TOKEN}`, // Get this from tina.io
  client: { skip: true },
  build: {
    outputFolder: "admin",
    publicFolder: "",
  },
  media: {
    tina: {
      mediaRoot: "public/uploads",
      publicFolder: "",
    },
  },
  schema: {
    collections: [
      {
        format: "md",
        label: "Posts",
        name: "posts",
        path: "posts",
        match: {
          include: "**/*",
          exclude: "",
        },
        ui: {
          filename: {
            readonly: false,
            slugify: values => {
              return `${values?.title?.toLowerCase().replace(/ /g, '-') || ''}`
            },
          },
        },
        fields: [
          ...blog_postFields(),
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
        ],
      },
      {
        format: "md",
        label: "About",
        name: "about",
        path: "about",
        match: {
          include: "**/*",
          exclude: "",
        },
        fields: [
          ...simple_pageFields(),
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
        ],
      },
      {
        format: "md",
        label: "Uses",
        name: "uses",
        path: "uses",
        match: {
          include: "**/*",
          exclude: "",
        },
        fields: [
          ...simple_pageFields(),
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
