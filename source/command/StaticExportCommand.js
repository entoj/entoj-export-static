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
     * @inheritDoc
     * @returns {String}
     */
    imageUrl(filter, value, args, data)
    {
        const hash = crypto.createHash('md5');
        hash.update(data.image);
        hash.update(data.width + '');
        hash.update(data.height + '');
        hash.update(data.forced + '');
        const md5 = hash.digest('hex');
        data.url = 'images/' + (path.basename(data.image).split('.').shift()) + '_' + md5 + path.extname(data.image);
        this.images[data.url] = data;
        return data.url;
    }


    /**
     * @inheritDoc
     * @returns {String}
     */
    assetUrl(filter, value, args, data)
    {
        const hash = crypto.createHash('md5');
        hash.update(value);
        const md5 = hash.digest('hex');
        data.path = value;
        const extension = path.extname(data.asset);
        const folder = (['.mp4', '.webm', '.ogg'].indexOf(extension) > -1)
            ? 'videos'
            : 'images';
        data.url = 'assets/' + folder + '/' + (path.basename(data.asset).split('.').shift()) + '_' + md5 + extension;
        this.assets[data.url] = data;
        return data.url;
    }


    /**
     * @inheritDoc
     * @returns {String}
     */
    svgUrl(filter, value, args, data)
    {
        const hash = crypto.createHash('md5');
        hash.update(value);
        const md5 = hash.digest('hex');
        data.path = value;
        data.url = 'assets/svg/' + (path.basename(data.asset).split('.').shift()) + '_' + md5 + '.svg#icon';
        this.svgs[data.url] = data;
        return data.url;
    }


    /**
     * @inheritDoc
     * @returns {String}
     */
    cssUrl(filter, value, args, data)
    {
        return 'css/' + data.site.name.urlify() + '-' + data.group + '.css';
    }


    /**
     * @inheritDoc
     * @returns {String}
     */
    jsUrl(filter, value, args, data)
    {
        switch (data.type)
        {
            case 'bundle':
                data.url = 'js/' + data.site.name.urlify() + '-' + data.group + '.js';
                break;
            
            case 'link':
                const hash = crypto.createHash('md5');
                hash.update(data.path);
                const md5 = hash.digest('hex');
                data.url = 'js/' + (path.basename(data.path).split('.').shift()) + '_' + md5 + '.js';
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
            const logger = scope.createLogger('command.export.static');
            const mapping = new Map();
            mapping.set(CliLogger, logger);
            const pathesConfiguration = scope.context.di.create(PathesConfiguration);
            const moduleConfiguration = scope.context.di.create(StaticModuleConfiguration);
            const buildConfiguration = scope.context.di.create(BuildConfiguration);
            const entitiesRepository = scope.context.di.create(EntitiesRepository);
            const imageRenderer = scope.context.di.create(ImageRenderer);
            const basePath = yield pathesConfiguration.resolve((parameters && parameters.destination) || moduleConfiguration.exportPath);
            const query = parameters && parameters._ && parameters._[0] || '*';


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
                    imageUrl: scope.imageUrl.bind(this),
                    assetUrl: scope.assetUrl.bind(this),
                    svgUrl: scope.svgUrl.bind(this),
                    cssUrl: scope.cssUrl.bind(this),
                    jsUrl: scope.jsUrl.bind(this)
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
                bundleTemplate: 'css/${site.name.urlify()}-${group}.scss'
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
                bundleTemplate: 'js/${site.name.urlify()}-${group}.js'
            };
            const jsTask = scope.context.di.create(JspmBundleTask, mapping)
                .pipe(scope.context.di.create(WriteFilesTask, mapping));
            yield jsTask.run(buildConfiguration, jsOptions);

            // Copy used images
            for (const imageUrl in this.images)
            {
                const image = this.images[imageUrl];
                const imageSourcePath = yield imageRenderer.resize(image.image, image.width, image.height, image.forced + '');
                const imageDestPath = path.join(basePath, image.url);
                yield fs.copy(imageSourcePath, imageDestPath);
            }

            // Copy used assets
            for (const assetUrl in this.assets)
            {
                const asset = this.assets[assetUrl];
                const assetSourcePath = path.join(pathesConfiguration.sites, asset.path);
                const assetDestPath = path.join(basePath, asset.url);
                yield fs.copy(assetSourcePath, assetDestPath);
            }

            // Copy used svgs
            for (const svgUrl in this.svgs)
            {
                const svg = this.svgs[svgUrl];
                const svgSourcePath = path.join(pathesConfiguration.sites, svg.path.replace(/#icon/, ''));
                const svgDestPath = path.join(basePath, svg.url.replace(/#icon/, ''));
                yield fs.copy(svgSourcePath, svgDestPath);
            }            

            // Copy configured assets
            const assetPathes =
            {
                'base/global/assets/fonts/*.*': 'assets/fonts'
            };
            for (const assetPath in assetPathes)
            {
                const sourcePath = path.join(pathesConfiguration.sites, assetPath);
                const targetPath = path.join(basePath, assetPathes[assetPath]);
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
        return this.export(parameters);
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.StaticExportCommand = StaticExportCommand;
