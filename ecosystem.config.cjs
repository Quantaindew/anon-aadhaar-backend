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
  }],

  deploy : {
    production : {
      user : 'paperspace',
      host : '184.105.118.135',
      ref  : 'origin/main',
      repo : 'https://github.com/Quantaindew/anon-aadhaar-backend.git',
      path : '/home/paperspace/anon-aadhaar-backend',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};