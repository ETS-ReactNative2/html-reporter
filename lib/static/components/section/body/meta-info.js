import path from 'path';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import PropTypes from 'prop-types';
import {map, mapValues, isObject, omitBy, isEmpty} from 'lodash';
import * as actions from '../../../modules/actions';
import Details from '../../details';
import {isUrl} from '../../../../common-utils';

const mkLinkToUrl = (url, text = url) => {
    return <a data-suite-view-link={url} className="section__icon_view-local" target="_blank" href={url}>{text}</a>;
};

const serializeMetaValues = (metaInfo) => mapValues(metaInfo, (v) => isObject(v) ? JSON.stringify(v) : v);

const resolveUrl = (baseUrl, value) => {
    const parsedBaseUrl = new URL(baseUrl);
    const baseSearchParams = new URLSearchParams(parsedBaseUrl.search);
    if (baseSearchParams) {
        parsedBaseUrl.search = '';
    }

    const resolvedUrl = new URL(value, parsedBaseUrl.href);

    for (let [key, value] of baseSearchParams) {
        resolvedUrl.searchParams.append(key, value);
    }

    return resolvedUrl.href;
};

const metaToElements = (metaInfo, metaInfoBaseUrls) => {
    return map(metaInfo, (value, key) => {
        if (isUrl(value)) {
            value = mkLinkToUrl(value);
        } else if (metaInfoBaseUrls[key]) {
            const baseUrl = metaInfoBaseUrls[key];
            const link = isUrl(baseUrl) ? resolveUrl(baseUrl, value) : path.join(baseUrl, value);
            value = mkLinkToUrl(link, value);
        } else if (typeof value === 'boolean') {
            value = value.toString();
        }

        return <div key = {key} className="meta-info__item"><span className="meta-info__item-key">{key}</span>: {value}</div>;
    });
};

class MetaInfo extends Component {
    static propTypes = {
        result: PropTypes.shape({
            metaInfo: PropTypes.object.isRequired,
            suiteUrl: PropTypes.string.isRequired
        }).isRequired,
        testName: PropTypes.string.isRequired,
        // from store
        metaInfoBaseUrls: PropTypes.object.isRequired,
        apiValues: PropTypes.shape({
            extraItems: PropTypes.object.isRequired,
            metaInfoExtenders: PropTypes.object.isRequired
        }).isRequired
    };

    getExtraMetaInfo = () => {
        const {testName, apiValues: {extraItems, metaInfoExtenders}} = this.props;

        return omitBy(mapValues(metaInfoExtenders, (extender) => {
            const stringifiedFn = extender.startsWith('return') ? extender : `return ${extender}`;

            return new Function(stringifiedFn)()({testName}, extraItems);
        }), isEmpty);
    }

    _renderMetaInfo = () => {
        const {result, metaInfoBaseUrls} = this.props;

        const serializedMetaValues = serializeMetaValues(result.metaInfo);
        const extraMetaInfo = this.getExtraMetaInfo();
        const formattedMetaInfo = {
            ...serializedMetaValues,
            ...extraMetaInfo,
            url: mkLinkToUrl(result.suiteUrl, result.metaInfo.url)
        };

        return metaToElements(formattedMetaInfo, metaInfoBaseUrls);
    }

    onToggleMetaInfo = () => {
        this.props.actions.toggleMetaInfo();
    }

    render() {
        return <Details
            title='Meta'
            content={this._renderMetaInfo}
            extendClassNames='details_type_text'
            onClick={this.onToggleMetaInfo}
        />;
    }
}

export default connect(
    ({config: {metaInfoBaseUrls}, apiValues}) => ({metaInfoBaseUrls, apiValues}),
    (dispatch) => ({actions: bindActionCreators(actions, dispatch)})
)(MetaInfo);
