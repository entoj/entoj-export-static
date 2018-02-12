'use strict';

/**
 * Requirements
 */
const StaticExportCommand = require(STATIC_SOURCE + '/command/StaticExportCommand.js').StaticExportCommand;
const exportCommandSpec = require('entoj-system/test').command.ExportCommandShared;
const projectFixture = require('entoj-system/test').fixture.project;


/**
 * Spec
 */
describe(StaticExportCommand.className, function()
{
    /**
     * Command Test
     */
    function prepareParameters()
    {
        const fixture = projectFixture.createDynamic();
        return [fixture.context];
    }

    exportCommandSpec(StaticExportCommand, 'command/StaticExportCommand', prepareParameters, { action: 'static' });
});
