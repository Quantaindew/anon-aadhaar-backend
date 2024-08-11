module.exports = {
  apps : [{
    name: "anon-aadhaar-backend",
    script: "dist/index.js",
    instances: 4,
    exec_mode: "cluster",
    autorestart: true,
    watch: false,
    max_memory_restart: '3.5G',
    node_args: "--max-old-space-size=3584 --expose-gc",
    env: {
      NODE_ENV: "production",
    },
    env_production: {
      NODE_ENV: "production",
    },
    exp_backoff_restart_delay: 100,
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    kill_timeout : 3000,
  }],
};