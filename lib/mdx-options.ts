import type { MDXRemoteProps } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"

// Only repository-authored MDX reaches this compiler. JSX expressions supply
// gallery arrays, image dimensions, and diagram strings.
export const mdxOptions = {
  blockJS: false,
  blockDangerousJS: true,
  mdxOptions: { remarkPlugins: [remarkGfm] },
} satisfies NonNullable<MDXRemoteProps["options"]>
