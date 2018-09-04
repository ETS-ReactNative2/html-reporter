'use strict';

const path = require('path');
const fs = require('fs-extra');
const ReportBuilder = require('lib/merge-reports/report-builder');
const DataTree = require('lib/merge-reports/data-tree');
const serverUtils = require('lib/server-utils');

describe('lib/merge-reports/report-builder', () => {
    const sandbox = sinon.sandbox.create();

    const buildReport_ = async (srcPaths, destPath = 'default-dest-report/path') => {
        return await ReportBuilder.create(srcPaths, destPath).build();
    };

    beforeEach(() => {
        sandbox.stub(serverUtils, 'require').returns({});
        sandbox.stub(serverUtils, 'prepareCommonJSData');
        sandbox.stub(serverUtils.logger, 'warn');
        sandbox.stub(fs, 'moveAsync');
        sandbox.stub(fs, 'writeFile');

        sandbox.stub(DataTree, 'create').returns(Object.create(DataTree.prototype));
        sandbox.stub(DataTree.prototype, 'mergeWith').resolves();
    });

    afterEach(() => sandbox.restore());

    it('should move "images" folder from first source report to destination report', async () => {
        const srcFilePath = path.resolve('src-report/path-1', 'images');
        const destFilePath = path.resolve('dest-report/path', 'images');

        await buildReport_(['src-report/path-1', 'src-report/path-2'], 'dest-report/path');

        assert.calledWith(fs.moveAsync, srcFilePath, destFilePath);
    });

    ['index.html', 'report.min.js', 'report.min.css'].forEach((fileName) => {
        it(`should move "${fileName}" file from first source report to destination report`, async () => {
            const srcFilePath = path.resolve('src-report/path-1', fileName);
            const destFilePath = path.resolve('dest-report/path', fileName);

            await buildReport_(['src-report/path-1', 'src-report/path-2'], 'dest-report/path');

            assert.calledWith(fs.moveAsync, srcFilePath, destFilePath);
        });
    });

    it('should not fail if data file does not find in source report path', async () => {
        const srcDataPath1 = path.resolve('src-report/path-1', 'data');
        serverUtils.require.withArgs(srcDataPath1).throws(new Error('Cannot find module'));

        await assert.isFulfilled(buildReport_(['src-report/path-1', 'src-report/path-2']));
    });

    it('should log a warning that there is no data file in source report path', async () => {
        const srcDataPath1 = path.resolve('src-report/path-1', 'data');
        serverUtils.require.withArgs(srcDataPath1).throws(new Error('Cannot find module'));

        await buildReport_(['src-report/path-1', 'src-report/path-2']);

        assert.calledWithMatch(
            serverUtils.logger.warn,
            'Not found data file in passed source report path: src-report/path-1'
        );
    });

    it('should read source data files from reports', async () => {
        const srcDataPath1 = path.resolve('src-report/path-1', 'data');
        const srcDataPath2 = path.resolve('src-report/path-2', 'data');

        await buildReport_(['src-report/path-1', 'src-report/path-2']);

        assert.calledTwice(serverUtils.require);
        assert.calledWith(serverUtils.require, srcDataPath1);
        assert.calledWith(serverUtils.require, srcDataPath2);
    });

    it('should create "DataTree" instance with passed data from first source path and destination path', async () => {
        const srcDataPath1 = path.resolve('src-report/path-1', 'data');
        serverUtils.require.withArgs(srcDataPath1).returns('report-data-1');

        await buildReport_(['src-report/path-1', 'src-report/path-2'], 'dest-report/path');

        assert.calledOnceWith(DataTree.create, 'report-data-1', 'dest-report/path');
    });

    it('should merge datas with passed source data collection execept the first one', async () => {
        const srcDataPath2 = path.resolve('src-report/path-2', 'data');
        serverUtils.require.withArgs(srcDataPath2).returns('report-data-2');

        await buildReport_(['src-report/path-1', 'src-report/path-2']);

        assert.calledOnceWith(DataTree.prototype.mergeWith, {'src-report/path-2': 'report-data-2'});
    });

    it('should convert merged data to commonjs format', async () => {
        DataTree.prototype.mergeWith.resolves('merged-data');

        await buildReport_(['src-report/path-1', 'src-report/path-2']);

        assert.calledOnceWith(serverUtils.prepareCommonJSData, 'merged-data');
    });

    it('should write merged data to destination report', async () => {
        serverUtils.prepareCommonJSData.returns('prepared-data');

        await buildReport_(['src-report/path-1', 'src-report/path-2'], 'dest-report/path');

        const destDataPath = path.resolve('dest-report/path', 'data.js');

        assert.calledOnceWith(fs.writeFile, destDataPath, 'prepared-data');
    });
});
