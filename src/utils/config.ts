import { readFileSync, existsSync } from 'fs';
import { Config, NotificationMethod } from '../types';
import { resolve } from 'path';

/**
 * Helper to get notification methods as array
 */
export function getNotificationMethods(config: Config): NotificationMethod[] {
  if (Array.isArray(config.notificationMethod)) {
    return config.notificationMethod;
  }
  return [config.notificationMethod];
}

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

  if (!config.notificationMethod) {
    errors.push('notificationMethod is required (e.g., "email", "file", or ["email", "file"])');
  }

  const methods = getNotificationMethods(config);

  // Validate email config if email method is enabled
  if (methods.includes('email')) {
    if (!config.email?.smtp?.auth?.user) {
      errors.push('email.smtp.auth.user is required when using email notification');
    }

    if (!config.email?.smtp?.auth?.pass) {
      errors.push('email.smtp.auth.pass is required when using email notification');
    }

    if (!config.email?.from) {
      errors.push('email.from is required when using email notification');
    }

    if (!config.email?.to) {
      errors.push('email.to is required when using email notification');
    }
  }

  // Validate file config if file method is enabled
  if (methods.includes('file')) {
    if (!config.file?.path) {
      errors.push('file.path is required when using file notification');
    }
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
