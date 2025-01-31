import _ from 'lodash';
import {isStatusMatchViewMode, isTestNameMatchFilters, shouldShowBrowser} from '../../../utils';
import {isNodeFailed} from '../../../utils';
import {changeNodeState, shouldNodeBeOpened} from '../helpers';

export function initBrowsersState(tree, view) {
    tree.browsers.allIds.forEach((browserId) => {
        setBrowsersLastRetry(tree, browserId);

        if (view.groupByError) {
            changeBrowserState(tree, browserId, {shouldBeShown: false});
        } else {
            calcBrowsersShowness(tree, view, browserId);
        }

        calcBrowsersOpenness(tree, view.expand, browserId);
    });
}

export function changeAllBrowsersState(tree, state) {
    tree.browsers.allIds.forEach((browserId) => {
        const retryIndex = getLastRetryIndex(tree, browserId);
        changeBrowserState(tree, browserId, {retryIndex, ...state});
    });
}

export function changeBrowserState(tree, browserId, state) {
    changeNodeState(tree.browsers.stateById, browserId, state);
}

export function setBrowsersLastRetry(tree, browserIds) {
    if (_.isEmpty(browserIds)) {
        browserIds = tree.browsers.allIds;
    }

    [].concat(browserIds).forEach((browserId) => {
        const retryIndex = getLastRetryIndex(tree, browserId);
        changeBrowserState(tree, browserId, {retryIndex});
    });
}

export function calcBrowsersShowness(tree, view, browserIds) {
    if (_.isEmpty(browserIds)) {
        browserIds = tree.browsers.allIds;
    }

    [].concat(browserIds).forEach((browserId) => {
        const browser = tree.browsers.byId[browserId];
        const lastResult = tree.results.byId[_.last(browser.resultIds)];
        const shouldBeShown = calcBrowserShowness(browser, lastResult, view);

        changeBrowserState(tree, browserId, {shouldBeShown});
    });
}

export function calcBrowsersOpenness(tree, expand, browserIds) {
    if (_.isEmpty(browserIds)) {
        browserIds = tree.browsers.allIds;
    }

    [].concat(browserIds).forEach((browserId) => {
        const browser = tree.browsers.byId[browserId];
        const lastResult = tree.results.byId[_.last(browser.resultIds)];
        const shouldBeOpened = calcBrowserOpenness(browser, lastResult, expand, tree);

        changeBrowserState(tree, browserId, {shouldBeOpened});
    });
}

function getLastRetryIndex(tree, browserId) {
    return tree.browsers.byId[browserId].resultIds.length - 1;
}

function calcBrowserOpenness(browser, lastResult, expand, tree) {
    const errorsCb = () => isNodeFailed(lastResult);
    const retriesCb = () => {
        const retries = [].concat(_.initial(browser.resultIds)).map((resultId) => tree.results.byId[resultId]);

        return retries.some((retry) => isNodeFailed(retry));
    };

    return shouldNodeBeOpened(expand, {errorsCb, retriesCb});
}

function calcBrowserShowness(browser, lastResult, view) {
    const {viewMode, filteredBrowsers, testNameFilter, strictMatchFilter} = view;

    if (!isStatusMatchViewMode(lastResult.status, viewMode)) {
        return false;
    }

    const testName = browser.parentId;

    if (!isTestNameMatchFilters(testName, testNameFilter, strictMatchFilter)) {
        return false;
    }

    return shouldShowBrowser(browser, filteredBrowsers);
}
