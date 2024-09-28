module.exports = {
  apps: [
    {
      name: "notes-api",
      script: "npm run start:prod",
      port: 3002,
      time: true,
    },
  ],
  deploy: {
    production: {
      user: "dev",
      host: "161.97.65.149",
      key: "radovanrasha.pem",
      ref: "origin/master",
      repo: "git@github.com:radovanrasha/notes-api.git",
      path: "/home/dev/notes/notes-api",
      env: {
        NODE_ENV: "production",
      },
      "post-deploy":
        "rm -rf node_modules && . ~/.nvm/nvm.sh && nvm use 20 && npm install && pm2 startOrRestart ecosystem.config.js --env production",
    },
  },
};
