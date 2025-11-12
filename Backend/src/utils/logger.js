/**
 * Simple Logger Utility
 * Can be extended with winston or other logging libraries
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class Logger {
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }

  static info(message, data = null) {
    const coloredMessage = `${colors.blue}ℹ INFO${colors.reset}`;
    this.log(coloredMessage, message, data);
  }

  static success(message, data = null) {
    const coloredMessage = `${colors.green}✓ SUCCESS${colors.reset}`;
    this.log(coloredMessage, message, data);
  }

  static warn(message, data = null) {
    const coloredMessage = `${colors.yellow}⚠ WARNING${colors.reset}`;
    this.log(coloredMessage, message, data);
  }

  static error(message, data = null) {
    const coloredMessage = `${colors.red}✗ ERROR${colors.reset}`;
    this.log(coloredMessage, message, data);
  }

  static debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      const coloredMessage = `${colors.magenta}◆ DEBUG${colors.reset}`;
      this.log(coloredMessage, message, data);
    }
  }
}

module.exports = Logger;
