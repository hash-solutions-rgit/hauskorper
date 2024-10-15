module.exports = {
  apps: [
    {
      namespace: "vapestation",
      name: "web",
      script: "yarn",
      interpreter: "bash",
      args: "start",
      cwd: "./apps/web",
    },
    {
      namespace: "vapestation",
      name: "api",
      script: "yarn",
      interpreter: "bash",
      args: "start",
      cwd: "./apps/api",
    },
    {
      namespace: "vapestation",
      name: "admin",
      script: "yarn",
      interpreter: "bash",
      args: "start",
      cwd: "./apps/admin",
    },
  ],

  deploy: {
    production: {
      user: "SSH_USERNAME",
      host: "SSH_HOSTMACHINE",
      ref: "origin/master",
      repo: "GIT_REPOSITORY",
      path: "DESTINATION_PATH",
      "pre-deploy-local": "",
      "post-deploy":
        "yarn install && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
