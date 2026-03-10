/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@shadowtwin/api-client",
    "@shadowtwin/config",
    "@shadowtwin/design-tokens",
    "@shadowtwin/sample-data",
    "@shadowtwin/shared-types",
    "@shadowtwin/ui",
    "@shadowtwin/utils",
    "@shadowtwin/validation",
  ],
};

export default nextConfig;
