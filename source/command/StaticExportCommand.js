'use strict';

/**
 * Requirements
 * @ignore
 */
const Command = require('entoj-system').command.Command;
const Context = require('entoj-system').application.Context;
const CliLogger = require('entoj-system').cli.CliLogger;
const StaticModuleConfiguration = require('../configuration/StaticModuleConfiguration.js').StaticModuleConfiguration;
const BeautifyHtmlTask = require('entoj-html').task.BeautifyHtmlTask;
const ExportHtmlTask = require('entoj-html').task.ExportHtmlTask;
const WriteFilesTask = require('entoj-system').task.WriteFilesTask;
const ReadFilesTask = require('entoj-system').task.ReadFilesTask;
const PathesConfiguration = require('entoj-system').model.configuration.PathesConfiguration;
const BuildConfiguration = require('entoj-system').model.configuration.BuildConfiguration;
const ImageRenderer = require('entoj-image').renderer.ImageRenderer;
const EntitiesRepository = require('entoj-system').model.entity.EntitiesRepository;
const BundleSassTask = require('entoj-sass').task.BundleSassTask;
const JspmBundleTask = require('entoj-jspm').task.JspmBundleTask;
const co = require('co');
const fs = require('co-fs-extra');
const crypto = require('crypto');
const path = require('path');
const gitRev = require('git-rev-promises');
const templateString = require('es6-template-strings');


/**
 * @memberOf command
 */
class StaticExportCommand extends Command
{
    /**
     * @param {application.Context} context
     */
    constructor(context)
    {
        super(context);

        // Assign options
        this.name = ['export'];
        this._moduleConfiguration = this.context.di.create(StaticModuleConfiguration);

        // Settings
        this.imageDirectory = 'images/';
        this.imageUrl = 'images/';
        this.videoDirectory = 'videos/';
        this.videoUrl = 'videos/';
        this.assetDirectory = 'assets/';
        this.assetUrl = 'assets/';
        this.cssDirectory = 'css/';
        this.cssUrl = 'css/';
        this.svgDirectory = 'assets/';
        this.svgUrl = 'assets/';

        // Storages
        this.images = {};
        this.assets = {};
        this.svgs = {};
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'command/StaticExportCommand';
    }


    /**
     * @inheritDoc
     */
    get help()
    {
        const help =
        {
            name: this._name,
            description: 'Generates static exports from modules incl. used images and assets',
            actions:
            [
                {
                    name: 'static',
                    description: 'Exports templates as static webpages',
                    options:
                    [
                        {
                            name: 'query',
                            type: 'inline',
                            optional: true,
                            defaultValue: '*',
                            description: 'Query for sites to use e.g. /base'
                        },
                        {
                            name: 'destination',
                            type: 'named',
                            value: 'path',
                            optional: true,
                            defaultValue: '',
                            description: 'Define a base folder where html files are written to'
                        }
                    ]
                },
            ]
        };
        return help;
    }


    /**
     * @type {configuration.StaticModuleConfiguration}
     */
    get moduleConfiguration()
    {
        return this._moduleConfiguration;
    }


    /**
     * @inheritDoc
     * @returns {Promise}
     */
    prepareSettings()
    {
        const scope = this;
        const promise = co(function*()
        {
            const data =
            {
                date: new Date(),
                gitHash: yield gitRev.long(),
                gitBranch: yield gitRev.branch()
            };
            const renderTemplate = (template) =>
            {
                let result = templateString(template, data);
                if (!result.endsWith('/'))
                {
                    result+= '/';
                }
                return result;
            };

            scope.imageDirectory = renderTemplate(scope.moduleConfiguration.imageDirectoryTemplate);
            scope.imageUrl = scope.moduleConfiguration.imageUrlTemplate
                ? renderTemplate(scope.moduleConfiguration.imageUrlTemplate)
                : scope.imageDirectory;
            scope.videoDirectory = renderTemplate(scope.moduleConfiguration.videoDirectoryTemplate);
            scope.videoUrl = scope.moduleConfiguration.videoUrlTemplate
                ? renderTemplate(scope.moduleConfiguration.videoUrlTemplate)
                : scope.videoDirectory;
            scope.assetDirectory = renderTemplate(scope.moduleConfiguration.assetDirectoryTemplate);
            scope.assetUrl = scope.moduleConfiguration.assetUrlTemplate
                ? renderTemplate(scope.moduleConfiguration.assetUrlTemplate)
                : scope.assetDirectory;
            scope.svgDirectory = renderTemplate(scope.moduleConfiguration.svgDirectoryTemplate);
            scope.svgUrl = scope.moduleConfiguration.svgUrlTemplate
                ? renderTemplate(scope.moduleConfiguration.svgUrlTemplate)
                : scope.svgDirectory;
            scope.cssDirectory = renderTemplate(scope.moduleConfiguration.cssDirectoryTemplate);
            scope.cssUrl = scope.moduleConfiguration.cssUrlTemplate
                ? renderTemplate(scope.moduleConfiguration.cssUrlTemplate)
                : scope.cssDirectory;
            scope.jsDirectory = renderTemplate(scope.moduleConfiguration.jsDirectoryTemplate);
            scope.jsUrl = scope.moduleConfiguration.jsUrlTemplate
                ? renderTemplate(scope.moduleConfiguration.jsUrlTemplate)
                : scope.jsDirectory;
        });
        return promise;
    }


    /**
     * @inheritDoc
     * @returns {String}
     */
    imageUrlCallback(filter, value, args, data)
    {
        const hash = crypto.createHash('md5');
        hash.update(data.image);
        hash.update(data.width + '');
        hash.update(data.height + '');
        hash.update(data.forced + '');
        const md5 = hash.digest('hex');
        data.file = (path.basename(data.image).split('.').shift()) + '_' + md5 + path.extname(data.image);
        data.url = this.imageUrl + data.file;
        data.filename = this.imageDirectory + data.file;
        this.images[data.url] = data;
        return data.url;
    }


    /**
     * @inheritDoc
     * @returns {String}
     */
    assetUrlCallback(filter, value, args, data)
    {
        const hash = crypto.createHash('md5');
        hash.update(value);
        const md5 = hash.digest('hex');
        data.path = value;
        const extension = path.extname(data.asset);
        const isVideo = (['.mp4', '.webm', '.ogg'].indexOf(extension) > -1);
        const directory = isVideo
            ? this.videoDirectory
            : this.assetDirectory;
        const url = isVideo
            ? this.videoUrl
            : this.assetUrl;
        data.file = (path.basename(data.asset).split('.').shift()) + '_' + md5 + extension;
        data.filename = directory + data.file;
        data.url = url + data.file;
        this.assets[data.url] = data;
        return data.url;
    }


    /**
     * @inheritDoc
     * @returns {String}
     */
    svgUrlCallback(filter, value, args, data)
    {
        const hash = crypto.createHash('md5');
        hash.update(value);
        const md5 = hash.digest('hex');
        data.path = value;
        data.file = (path.basename(data.asset).split('.').shift()) + '_' + md5 + '.svg#icon';
        data.filename = this.svgDirectory + data.file;
        data.url = this.svgUrl + data.file;
        this.svgs[data.url] = data;
        return data.url;
    }


    /**
     * @inheritDoc
     * @returns {String}
     */
    cssUrlCallback(filter, value, args, data)
    {
        return this.cssUrl + data.site.name.urlify() + '-' + data.group + '.css';
    }


    /**
     * @inheritDoc
     * @returns {String}
     */
    jsUrlCallback(filter, value, args, data)
    {
        switch (data.type)
        {
            case 'bundle':
                data.url = this.jsUrl + data.site.name.urlify() + '-' + data.group + '.js';
                break;

            case 'link':
                const hash = crypto.createHash('md5');
                hash.update(data.path);
                const md5 = hash.digest('hex');
                data.url = this.jsUrl + (path.basename(data.path).split('.').shift()) + '_' + md5 + '.js';
                this.assets[data.url] = data;
                break;
        }
        return data.url;
    }


    /**
     * @inheritDoc
     * @returns {Promise<Server>}
     */
    export(parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Prepare
            const logger = scope.createLogger('command.export.static');
            const mapping = new Map();
            mapping.set(CliLogger, logger);
            const pathesConfiguration = scope.context.di.create(PathesConfiguration);
            const buildConfiguration = scope.context.di.create(BuildConfiguration);
            const entitiesRepository = scope.context.di.create(EntitiesRepository);
            const imageRenderer = scope.context.di.create(ImageRenderer);
            const basePath = yield pathesConfiguration.resolve((parameters && parameters.destination) || scope.moduleConfiguration.exportPath);
            const query = parameters && parameters._ && parameters._[0] || '*';
            yield scope.prepareSettings();

            // Create html
            this.images = {};
            this.assets = {};
            this.svgs = {};
            const htmlOptions =
            {
                query: query,
                exportName: 'static',
                filepathTemplate: '',
                filterCallbacks:
                {
                    imageUrl: scope.imageUrlCallback.bind(scope),
                    assetUrl: scope.assetUrlCallback.bind(scope),
                    svgUrl: scope.svgUrlCallback.bind(scope),
                    cssUrl: scope.cssUrlCallback.bind(scope),
                    jsUrl: scope.jsUrlCallback.bind(scope)
                },
                writePath: basePath
            };
            const exportHtmlTask = scope.context.di.create(ExportHtmlTask, mapping);
            let task = exportHtmlTask;
            if (buildConfiguration.get('html.beautify', false) === true)
            {
                task = task.pipe(scope.context.di.create(BeautifyHtmlTask, mapping));
            }
            task = task.pipe(scope.context.di.create(WriteFilesTask, mapping));
            yield task.run(buildConfiguration, htmlOptions);

            // Create list of used entites
            const entities = [];
            for (const id in exportHtmlTask.nunjucks.template.calls)
            {
                const entity = yield entitiesRepository.getById(id);
                if (entity)
                {
                    entities.push(entity.entity);
                }
            }
            for (const id of exportHtmlTask.nunjucks.template.extends)
            {
                const entity = yield entitiesRepository.getById(id);
                if (entity)
                {
                    entities.push(entity.entity);
                }
            }

            // Compile sass
            const sassOptions =
            {
                query: query,
                entities: entities,
                writePath: basePath,
                bundleTemplate: scope.cssDirectory + '${site.name.urlify()}-${group}.scss'
            };
            const sassTask = scope.context.di.create(BundleSassTask, mapping)
                .pipe(scope.context.di.create(WriteFilesTask, mapping));
            yield sassTask.run(buildConfiguration, sassOptions);

            // Compile js
            const jsOptions =
            {
                query: query,
                entities: entities,
                writePath: basePath,
                bundleTemplate: scope.jsDirectory + '${site.name.urlify()}-${group}.js'
            };
            const jsTask = scope.context.di.create(JspmBundleTask, mapping)
                .pipe(scope.context.di.create(WriteFilesTask, mapping));
            yield jsTask.run(buildConfiguration, jsOptions);

            // Copy used images
            for (const imageUrl in scope.images)
            {
                const image = scope.images[imageUrl];
                const imageSourcePath = yield imageRenderer.resize(image.image, image.width, image.height, image.forced + '');
                const imageDestPath = path.join(basePath, image.filename);
                const work = logger.work('Adding image <' + image.image + '>');
                yield fs.copy(imageSourcePath, imageDestPath);
                logger.end(work);
            }

            // Copy used assets
            for (const assetUrl in scope.assets)
            {
                const asset = scope.assets[assetUrl];
                const assetSourcePath = path.join(pathesConfiguration.sites, asset.path);
                const assetDestPath = path.join(basePath, asset.filename);
                const work = logger.work('Adding asset <' + asset.path + '>');
                yield fs.copy(assetSourcePath, assetDestPath);
                logger.end(work);
            }

            // Copy used svgs
            for (const svgUrl in scope.svgs)
            {
                const svg = scope.svgs[svgUrl];
                const svgSourcePath = path.join(pathesConfiguration.sites, svg.path.replace(/#icon/, ''));
                const svgDestPath = path.join(basePath, svg.url.replace(/#icon/, ''));
                const work = logger.work('Adding svg <' + svg.path + '>');
                yield fs.copy(svgSourcePath, svgDestPath);
                logger.end(work);
            }

            // Copy configured assets
            for (const assetPath in scope.moduleConfiguration.copyAssets)
            {
                const sourcePath = path.join(pathesConfiguration.sites, assetPath);
                const targetPath = path.join(basePath, scope.moduleConfiguration.copyAssets[assetPath]);
                const copyAssetsOptions =
                    {
                        readPath: sourcePath,
                        readPathBase: path.dirname(sourcePath),
                        writePath: targetPath
                    };
                yield scope.context.di.create(ReadFilesTask, mapping)
                    .pipe(scope.context.di.create(WriteFilesTask, mapping))
                    .run(buildConfiguration, copyAssetsOptions);
            }
        });
        return promise;
    }


    /**
     * @inheritDoc
     */
    dispatch(action, parameters)
    {
        if (action == 'static')
        {
            return this.export(parameters);
        }
        return Promise.resolve(false);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.StaticExportCommand = StaticExportCommand;
