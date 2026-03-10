/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@shadowtwin/design-tokens",
    "@shadowtwin/sample-data",
    "@shadowtwin/shared-types",
  ],
};

export default nextConfig;

