'use strict';

/**
 * Requirements
 */
const StaticExportCommand = require(STATIC_SOURCE + '/command/StaticExportCommand.js').StaticExportCommand;
const baseSpec = require('entoj-system/test').BaseShared;
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

    baseSpec(StaticExportCommand, 'command/StaticExportCommand', prepareParameters);
});
