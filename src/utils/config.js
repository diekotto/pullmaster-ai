// src/utils/config.js
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const CONFIG_FILENAME = '.pullmasterrc';

async function findConfig(startPath = process.cwd()) {
  let currentPath = startPath;
  
  while (true) {
    const configPath = path.join(currentPath, CONFIG_FILENAME);
    try {
      await fs.access(configPath);
      return configPath;
    } catch (error) {
      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath) {
        // Reached root without finding config
        return path.join(os.homedir(), CONFIG_FILENAME);
      }
      currentPath = parentPath;
    }
  }
}

async function loadConfig(configPath) {
  try {
    const filePath = configPath || await findConfig();
    const configContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('Configuration file not found. Run \'pullmaster configure --init\' to create one.');
    }
    throw new Error(`Error loading configuration: ${error.message}`);
  }
}

async function saveConfig(config, configPath) {
  try {
    const filePath = configPath || await findConfig();
    await fs.writeFile(filePath, JSON.stringify(config, null, 2));
  } catch (error) {
    throw new Error(`Error saving configuration: ${error.message}`);
  }
}

module.exports = {
  loadConfig,
  saveConfig,
  findConfig
};
