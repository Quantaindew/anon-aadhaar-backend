module.exports = {
  apps : [{
    name: "anon-aadhaar-backend",
    script: "dist/index.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    node_args: "--expose-gc --max-old-space-size=2048",
    env: {
      NODE_ENV: "production",
    },
  }]
};