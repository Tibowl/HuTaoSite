/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["cdn.discordapp.com", "discord.com", "i.imgur.com"],
    minimumCacheTTL: 3600
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/img/:all*(svg|jpg|png)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=28800",
          },
          {
            key: "Age",
            value: "0",
          }
        ],
      },
      {
        source: "/favicon.ico",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800",
          },
          {
            key: "Age",
            value: "0",
          }
        ],
      },
    ]
  },
}
