export default ({ config }) => ({
  ...config,
    name: getAppName(),
  ios: {
    ...config.ios,
    bundleIdentifier: getUniqueIdentifier(),
  },
  android: {
    ...config.android,
    package: getUniqueIdentifier(),
  },
});

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.millarys.eastutorial.dev';
  }

  if (IS_PREVIEW) {
    return 'com.millarys.eastutorial.preview';
  }

  return 'com.millarys.eastutorial';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'EAS Tutorial (Dev)';
  }

  if (IS_PREVIEW) {
    return 'EAS Tutorial (Preview)';
  }

  return 'EAS Tutorial: Production';
};

