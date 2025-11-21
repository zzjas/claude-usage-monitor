import { readFileSync, existsSync } from 'fs';
import { Config } from '../types';
import { resolve } from 'path';

/**
 * Loads configuration from file
 */
export function loadConfig(configPath: string = 'config.json'): Config {
  const fullPath = resolve(process.cwd(), configPath);

  if (!existsSync(fullPath)) {
    throw new Error(
      `Configuration file not found: ${fullPath}\n` +
      'Please create a config.json file. See config.example.json for reference.'
    );
  }

  try {
    const data = readFileSync(fullPath, 'utf-8');
    const config: Config = JSON.parse(data);

    // Validate required fields
    validateConfig(config);

    return config;
  } catch (error: any) {
    throw new Error(`Failed to load configuration: ${error.message}`);
  }
}

/**
 * Validates configuration object
 */
function validateConfig(config: Config): void {
  const errors: string[] = [];

  if (!config.email?.smtp?.auth?.user) {
    errors.push('email.smtp.auth.user is required');
  }

  if (!config.email?.smtp?.auth?.pass) {
    errors.push('email.smtp.auth.pass is required');
  }

  if (!config.email?.from) {
    errors.push('email.from is required');
  }

  if (!config.email?.to) {
    errors.push('email.to is required');
  }

  if (!config.schedule?.checkInterval) {
    errors.push('schedule.checkInterval is required');
  }

  if (errors.length > 0) {
    throw new Error(
      'Configuration validation failed:\n' + errors.map(e => `  - ${e}`).join('\n')
    );
  }
}
