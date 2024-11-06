const winston = require("winston");
const logstash = require('winston-logstash-transport');

const MESSAGE = Symbol.for('message');
const LEVEL = Symbol.for('level');

// Custom error formatting function
const errorToLog = log => {
  // Convert an instance of the Error class to a formatted log
  const formatted = {
    message: null,
    level: 'error',
  };
  formatted[LEVEL] = 'error';
  if (log.message) {
    formatted.message = `${log.message}: ${log.stack}`;
  } else {
    formatted.message = log.stack;
  }
  return formatted;
};

// Custom error formatter for winston
const errorFormatter = winston.format((info) => {
  // If the log is an instance of Error, format the error message and stack correctly
  if (info instanceof Error) {
    return errorToLog(info); // Return the formatted error
  }

  // If we have a stack trace (indicating this is an error), format the message and stack
  if (info.stack) {
    info.message = `${info.message}: ${info.stack}`;
  }

  // If the message is an object (e.g., an error object), format it
  if (info.message && typeof info.message === 'object') {
    if (info.message.err instanceof Error) {
      return errorToLog(info.message.err); // Format the embedded error
    } else {
      info.message = JSON.stringify(info.message); // Stringify non-error objects
    }
  }

  // Ensure that we always return a log with a valid message
  if (!info.message) {
    info.message = 'No message provided'; // Fallback if message is undefined
  }

  return info;
});

// Console transport configuration
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.cli({
      colors: {
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        http: 'green',
        verbose: 'cyan',
        debug: 'white',
      },
    }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),  // Custom timestamp format
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;  // Custom log message format
    }),
  ),
  handleExceptions: true
});

// Logstash transport configuration
const logstashTransportInstance = new logstash.LogstashTransport({
  host: 'localhost',
  port: 1514,
  level: 'info',  // Optional: You can control the minimum level of logs sent to Logstash
  exceptionMessage: 'exception',  // Optional: Custom exception message key
});

const transports = [
  consoleTransport,
  logstashTransportInstance
];

// Create the logger instance with custom formatting and transports
const logger = winston.createLogger({
  level: "info",  // Default log level
  format: winston.format.combine(
    // errorFormatter(),  // Apply the custom error formatter globally
    winston.format.simple()  // Ensure that simple log output format is used
  ),
  transports: transports
});

module.exports = logger;
