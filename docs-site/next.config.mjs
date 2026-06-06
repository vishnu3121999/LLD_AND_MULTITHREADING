import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/
});

export default withMDX({
  devIndicators: false,
  pageExtensions: ["js", "jsx", "md", "mdx"],
  outputFileTracingIncludes: {
    "/api/java/**/*": ["./content/java-modules/**/*"],
    "/api/hld/**/*": ["./content/hld/**/*", "./public/hld/**/*"]
  },
  turbopack: {
    root: process.cwd()
  },
  experimental: {
    mdxRs: true
  }
});
