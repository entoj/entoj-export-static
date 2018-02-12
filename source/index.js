'use strict';

/**
 * Registers with default configurations
 */
function register(configuration, options)
{
    // Commands
    configuration.commands.add(require('./index.js').command.StaticExportCommand);
}


/**
 * Exports
 * @ignore
 */
module.exports =
{
    register: register,
    command: require('./command/index.js'),
    configuration: require('./configuration/index.js'),
    task: require('./task/index.js')
};
