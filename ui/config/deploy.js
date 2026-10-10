var VALID_DEPLOY_TARGETS = ['production', 'sandbox'];

module.exports = function (deployTarget) {
  var ENV = {
    build: {
      environment: 'production',
    },
    redis: {
      allowOverwrite: true,
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
      port: process.env.REDIS_PORT,
    },
    s3: {
      bucket: `prison-rideshare-${deployTarget}`,
      region: 'us-east-1',
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET,
    },
  };
  if (VALID_DEPLOY_TARGETS.indexOf(deployTarget) === -1) {
    throw new Error('Invalid deployTarget ' + deployTarget);
  }

  ENV.redis.keyPrefix = deployTarget;

  return ENV;
};
