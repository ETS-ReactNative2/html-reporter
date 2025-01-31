import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {capitalize} from 'lodash';
import * as actions from '../../modules/actions';
import ControlButton from './control-button';
import ControlSelect from './control-select';
import BaseHostInput from './base-host-input';
import MenuBar from './menu-bar';
import viewModes from '../../../constants/view-modes';
import diffModes from '../../../constants/diff-modes';
import {EXPAND_ALL, COLLAPSE_ALL, EXPAND_ERRORS, EXPAND_RETRIES} from '../../../constants/expand-modes';

class ControlButtons extends Component {
    render() {
        const {actions, view} = this.props;

        return (
            <div className="common-controls">
                <ControlSelect
                    label="Show tests"
                    value={view.viewMode}
                    handler={actions.changeViewMode}
                    options = {Object.values(viewModes).map((value) => ({value, text: capitalize(value)}))}
                />
                <div className="control-group">
                    <ControlButton
                        label="Expand all"
                        isControlGroup={true}
                        isActive={view.expand === EXPAND_ALL}
                        handler={actions.expandAll}
                    />
                    <ControlButton
                        label="Collapse all"
                        isControlGroup={true}
                        isActive={view.expand === COLLAPSE_ALL}
                        handler={actions.collapseAll}
                    />
                    <ControlButton
                        label="Expand errors"
                        isControlGroup={true}
                        isActive={view.expand === EXPAND_ERRORS}
                        handler={actions.expandErrors}
                    />
                    <ControlButton
                        label="Expand retries"
                        isControlGroup={true}
                        isActive={view.expand === EXPAND_RETRIES}
                        handler={actions.expandRetries}
                    />
                </div>
                <ControlButton
                    label="Show skipped"
                    isActive={view.showSkipped}
                    handler={actions.toggleSkipped}
                />
                <ControlSelect
                    label="Diff mode"
                    value={view.diffMode}
                    handler={actions.changeDiffMode}
                    options = {Object.values(diffModes).map((dm) => {
                        return {value: dm.id, text: dm.title};
                    })}
                    extendClassNames="diff-mode"
                />
                <ControlButton
                    label="Group by error"
                    isActive={Boolean(view.groupByError)}
                    handler={actions.toggleGroupByError}
                />
                <BaseHostInput/>
                <MenuBar />
            </div>
        );
    }
}

export default connect(
    ({view}) => ({view}),
    (dispatch) => ({actions: bindActionCreators(actions, dispatch)})
)(ControlButtons);
