/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Estas librerías son binarios nativos o hacen dynamic require a nivel de
  // módulo. Excluirlas del bundling del servidor evita errores de build.
  serverExternalPackages: ["@react-pdf/renderer", "@resvg/resvg-js"],
};

module.exports = nextConfig;
