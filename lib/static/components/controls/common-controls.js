'use strict';
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as actions from '../../modules/actions';
import ControlButton from './control-button';
import ViewSelect from './view-select';
import BaseHostInput from './base-host-input';
import MenuBar from './menu-bar';
import viewModes from '../../../constants/view-modes';
import {EXPAND_ALL, COLLAPSE_ALL, EXPAND_ERRORS, EXPAND_RETRIES} from '../../../constants/expand-modes';

class ControlButtons extends Component {
    render() {
        const {actions, view} = this.props;

        return (
            <div className="common-controls">
                <ViewSelect options = {[
                    {value: viewModes.ALL, text: 'Show all'},
                    {value: viewModes.FAILED, text: 'Show only failed'}
                ]}/>
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
                <ControlButton
                    label="Show only diff"
                    isActive={view.showOnlyDiff}
                    handler={actions.toggleOnlyDiff}
                />
                <ControlButton
                    label="Scale images"
                    isActive={view.scaleImages}
                    handler={actions.toggleScaleImages}
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
