'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('entoj-system').Base;
const GlobalConfiguration = require('entoj-system').model.configuration.GlobalConfiguration;
const BuildConfiguration = require('entoj-system').model.configuration.BuildConfiguration;
const assertParameter = require('entoj-system').utils.assert.assertParameter;


/**
 * @memberOf configuration
 */
class StaticModuleConfiguration extends Base
{
    /**
     * @param  {model.configuration.GlobalConfiguration} globalConfiguration
     * @param {model.configuration.BuildConfiguration} buildConfiguration
     */
    constructor(globalConfiguration, buildConfiguration)
    {
        super();

        //Check params
        assertParameter(this, 'globalConfiguration', globalConfiguration, true, GlobalConfiguration);
        assertParameter(this, 'buildConfiguration', buildConfiguration, true, BuildConfiguration);


        // Create configuration
        this._exportPath = buildConfiguration.get('static.exportPath', globalConfiguration.get('static.exportPath', '${cache}/static/export'));
        this._imageDirectoryTemplate = buildConfiguration.get('static.imageDirectoryTemplate', globalConfiguration.get('static.imageDirectoryTemplate', 'images'));
        this._imageUrlTemplate = buildConfiguration.get('static.imageUrlTemplate', globalConfiguration.get('static.imageUrlTemplate', ''));
        this._videoDirectoryTemplate = buildConfiguration.get('static.videoDirectoryTemplate', globalConfiguration.get('static.videoDirectoryTemplate', 'videos'));
        this._videoUrlTemplate = buildConfiguration.get('static.videoUrlTemplate', globalConfiguration.get('static.videoUrlTemplate', ''));
        this._assetDirectoryTemplate = buildConfiguration.get('static.assetDirectoryTemplate', globalConfiguration.get('static.assetDirectoryTemplate', 'assets'));
        this._assetUrlTemplate = buildConfiguration.get('static.assetUrlTemplate', globalConfiguration.get('static.assetUrlTemplate', ''));
        this._svgDirectoryTemplate = buildConfiguration.get('static.svgDirectoryTemplate', globalConfiguration.get('static.svgDirectoryTemplate', 'assets'));
        this._svgUrlTemplate = buildConfiguration.get('static.svgUrlTemplate', globalConfiguration.get('static.svgUrlTemplate', ''));
        this._cssDirectoryTemplate = buildConfiguration.get('static.cssDirectoryTemplate', globalConfiguration.get('static.cssDirectoryTemplate', 'css'));
        this._cssUrlTemplate = buildConfiguration.get('static.cssUrlTemplate', globalConfiguration.get('static.cssUrlTemplate', ''));
        this._jsDirectoryTemplate = buildConfiguration.get('static.jsDirectoryTemplate', globalConfiguration.get('static.jsDirectoryTemplate', 'js'));
        this._jsUrlTemplate = buildConfiguration.get('static.jsUrlTemplate', globalConfiguration.get('static.jsUrlTemplate', ''));
        this._copyAssets = buildConfiguration.get('static.copyAssets', globalConfiguration.get('static.copyAssets',
            {
                'base/global/assets/fonts/*.*': 'assets/fonts',
                'base/global/assets/images/*.*': 'assets/images'
            }));
    }


    /**
     * @inheritDocs
     */
    static get injections()
    {
        return { 'parameters': [GlobalConfiguration, BuildConfiguration] };
    }


    /**
     * @inheritDocss
     */
    static get className()
    {
        return 'configuration/StaticModuleConfiguration';
    }


    /**
     * The path to the folder where files are exported to
     *
     * @type {String}
     */
    get exportPath()
    {
        return this._exportPath;
    }


    /**
     * @type {String}
     */
    get imageDirectoryTemplate()
    {
        return this._imageDirectoryTemplate;
    }


    /**
     * @type {String}
     */
    get imageUrlTemplate()
    {
        return this._imageUrlTemplate;
    }


    /**
     * @type {String}
     */
    get videoDirectoryTemplate()
    {
        return this._videoDirectoryTemplate;
    }


    /**
     * @type {String}
     */
    get videoUrlTemplate()
    {
        return this._videoUrlTemplate;
    }


    /**
     * @type {String}
     */
    get assetDirectoryTemplate()
    {
        return this._assetDirectoryTemplate;
    }


    /**
     * @type {String}
     */
    get assetUrlTemplate()
    {
        return this._assetUrlTemplate;
    }


    /**
     * @type {String}
     */
    get svgDirectoryTemplate()
    {
        return this._svgDirectoryTemplate;
    }


    /**
     * @type {String}
     */
    get svgUrlTemplate()
    {
        return this._svgUrlTemplate;
    }


    /**
     * @type {String}
     */
    get cssDirectoryTemplate()
    {
        return this._cssDirectoryTemplate;
    }


    /**
     * @type {String}
     */
    get cssUrlTemplate()
    {
        return this._cssUrlTemplate;
    }


    /**
     * @type {String}
     */
    get jsDirectoryTemplate()
    {
        return this._jsDirectoryTemplate;
    }


    /**
     * @type {String}
     */
    get jsUrlTemplate()
    {
        return this._jsUrlTemplate;
    }


    /**
     * @type {Object}
     */
    get copyAssets()
    {
        return this._copyAssets;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.StaticModuleConfiguration = StaticModuleConfiguration;
