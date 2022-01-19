// Save the original console.log
var log = console.log;
var error = console.error;
var warn = console.warn;

const customConsole = function (prefixString, consoleFunction) {
	return function (...args) {
		// Add the prefix to the arguments passed
		args.unshift(prefixString);

		// Call the original console.log with the arguments (including prefix)
		consoleFunction.apply(console, args);
	};
};

export function customLog(prefixString) {
	return customConsole(prefixString, log);
}

export function customError(prefixString) {
	return customConsole(prefixString, error);
}

export function customWarn(prefixString) {
	return customConsole(prefixString, warn);
}
