import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/
});

export default withMDX({
  pageExtensions: ["js", "jsx", "md", "mdx"],
  turbopack: {
    root: process.cwd()
  },
  experimental: {
    mdxRs: true
  }
});
