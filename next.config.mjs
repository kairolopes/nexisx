/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Restrito ao Supabase Storage (URLs assinadas). O projeto não usa next/image
    // com hosts externos hoje; mantemos a superfície mínima. Ao adicionar um novo
    // host legítimo, inclua-o aqui explicitamente (evitar curinga "**").
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
