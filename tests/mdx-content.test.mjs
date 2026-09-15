import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import matter from "gray-matter"
import { compileMDX } from "next-mdx-remote/rsc"
import { renderToStaticMarkup } from "react-dom/server"
import { mdxOptions } from "../lib/mdx-options.ts"

const commonComponents = {
  Callout: ({ children }) => children,
  Image: () => null,
  RelatedContent: () => null,
}

async function renderEntry(slug, components) {
  const source = await readFile(new URL(`../content/projects/${slug}.mdx`, import.meta.url), "utf8")
  const { content } = await compileMDX({
    source: matter(source).content,
    options: mdxOptions,
    components: { ...commonComponents, ...components },
  })
  renderToStaticMarkup(content)
}

test("MDX preserves the concept's diagram text and numeric image dimensions", async () => {
  let diagrams = 0
  let images = 0
  await renderEntry("living-patch-maps", {
    Mermaid: ({ chart }) => {
      assert.match(chart, /^flowchart TD/)
      assert.match(chart, /Candidate event timeline/)
      diagrams += 1
      return null
    },
    Image: ({ width, height }) => {
      assert.equal(typeof width, "number")
      assert.equal(typeof height, "number")
      images += 1
      return null
    },
  })
  assert.equal(diagrams, 1)
  assert.equal(images, 1)
})

test("MDX preserves gallery items and their captions", async () => {
  let galleries = 0
  await renderEntry("bursting-panopticon", {
    Gallery: ({ items }) => {
      assert.equal(items.length, 2)
      for (const item of items) {
        assert.match(item.src, /^\/projects\/bursting-panopticon\//)
        assert.ok(item.alt)
        assert.ok(item.caption)
      }
      galleries += 1
      return null
    },
  })
  assert.equal(galleries, 1)
})
