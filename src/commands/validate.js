// src/commands/validate.js
const { loadConfig } = require('../utils/config');

async function validate(options = {}) {
  try {
    const config = await loadConfig(options.config);
    const issues = [];

    // Validate GitHub configuration
    if (!config.github?.token) {
      issues.push('GitHub token is missing');
    }

    // Validate analysis configuration
    if (config.analysis) {
      if (typeof config.analysis.maxFiles !== 'undefined' && 
          (!Number.isInteger(config.analysis.maxFiles) || config.analysis.maxFiles < 1)) {
        issues.push('analysis.maxFiles must be a positive integer');
      }

      if (config.analysis.excludePaths && !Array.isArray(config.analysis.excludePaths)) {
        issues.push('analysis.excludePaths must be an array');
      }

      if (config.analysis.aiModel && typeof config.analysis.aiModel !== 'string') {
        issues.push('analysis.aiModel must be a string');
      }
    }

    // Report validation results
    if (!options.quiet) {
      if (issues.length === 0) {
        console.log('Configuration is valid! ✅');
        console.log('\nCurrent configuration:');
        console.log(JSON.stringify(config, null, 2));
      } else {
        console.error('Configuration validation failed! ❌');
        console.error('\nIssues found:');
        issues.forEach(issue => console.error(`- ${issue}`));
        process.exit(1);
      }
    }

    return issues.length === 0;
  } catch (error) {
    if (!options.quiet) {
      console.error('Error validating configuration:', error.message);
    }
    process.exit(1);
  }
}

module.exports = validate;
