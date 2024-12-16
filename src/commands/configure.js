// src/commands/configure.js
const { loadConfig, saveConfig } = require('../utils/config');

async function configure(options) {
  try {
    let config = {};
    
    // Try to load existing config
    try {
      config = await loadConfig();
    } catch (err) {
      if (options.init) {
        console.log('Initializing new configuration...');
      } else {
        throw err;
      }
    }

    // Update configuration based on provided options
    if (options.githubToken) {
      config.github = config.github || {};
      config.github.token = options.githubToken;
    }

    // If --init flag is present, ensure default values
    if (options.init) {
      config = {
        github: {
          token: config.github?.token || '',
        },
        analysis: {
          maxFiles: config.analysis?.maxFiles || 50,
          excludePaths: config.analysis?.excludePaths || [],
          aiModel: config.analysis?.aiModel || 'gpt-4'
        },
        ...config
      };
    }

    // Save the configuration
    await saveConfig(config);
    console.log('Configuration updated successfully!');

    // Validate the configuration after saving
    const validate = require('./validate');
    await validate({ quiet: true });

  } catch (error) {
    console.error('Error configuring pullmaster:', error.message);
    process.exit(1);
  }
}

module.exports = configure;
