'use strict';

const defaults = require('../../constants/defaults');
const viewModes = require('../../constants/view-modes');
const diffModes = require('../../constants/diff-modes');
const {EXPAND_ERRORS} = require('../../constants/expand-modes');

export default Object.assign(defaults, {
    gui: true,
    running: false,
    processing: false,
    stopping: false,
    autoRun: false,
    skips: [],
    browsers: [],
    groupedErrors: [],
    tree: {
        suites: {
            byId: {},
            allIds: [],
            allRootIds: [],
            failedRootIds: []
        },
        browsers: {
            byId: {},
            stateById: {},
            allIds: []
        },
        results: {
            byId: {},
            allIds: []
        },
        images: {
            byId: {},
            stateById: {},
            allIds: []
        }
    },
    closeIds: [],
    apiValues: {
        extraItems: {},
        metaInfoExtenders: {}
    },
    loading: {},
    modals: [],
    stats: {
        all: {
            total: 0,
            updated: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            retries: 0,
            warned: 0
        },
        perBrowser: {}
    },
    view: {
        viewMode: viewModes.ALL,
        diffMode: diffModes.THREE_UP.id,
        expand: EXPAND_ERRORS,
        showSkipped: false,
        baseHost: '',
        testNameFilter: '',
        strictMatchFilter: false,
        filteredBrowsers: [],
        groupByError: false
    },
    db: undefined,
    fetchDbDetails: [],
    progressBar: {
        currentRootSuiteId: null
    }
});
