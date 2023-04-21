import type { TinaField } from "tinacms";
export function blog_postFields() {
  return [
    {
      type: "boolean",
      name: "draft",
      label: "Draft",
    },
    {
      type: "string",
      name: "title",
      label: "title",
      isTitle: true,
      required: true,
    },
    {
      type: "string",
      name: "description",
      label: "description",
    },
    {
      type: "datetime",
      name: "date",
      label: "date",
      required: true,
    },
    {
      type: "string",
      name: "tags",
      label: "tags",
      list: true,
    },
    {
      type: "string",
      name: "layout",
      label: "layout",
    },
  ] as TinaField[];
}
export function simple_pageFields() {
  return [
    {
      type: "string",
      name: "layout",
      label: "layout",
    },
    {
      type: "string",
      name: "title",
      label: "title",
      isTitle: true,
      required: true,
    },
    {
      type: "string",
      name: "templateClass",
      label: "templateClass",
    },
    {
      type: "object",
      name: "eleventyNavigation",
      label: "eleventyNavigation",
      fields: [
        {
          type: "string",
          name: "key",
          label: "key",
        },
        {
          type: "number",
          name: "order",
          label: "order",
        },
      ],
    },
  ] as TinaField[];
}
