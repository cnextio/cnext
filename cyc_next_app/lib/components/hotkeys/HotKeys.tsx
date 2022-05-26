import React from 'react';
import Hotkeys from 'react-hot-keys';
import store from '../../../redux/store';
import { connect, useDispatch } from 'react-redux';
import { setProjectConfig } from '../../../redux/reducers/ProjectManagerRedux';

class HotkeysComponent extends React.Component {
    constructor(props) {
        super(props);

        let state = store.getState();
        let appShortcut = state.projectManager.configs.app_shortcut;
        let config = state.projectManager.configs.code_editor;
        let appShortcutList = [];
        for (let value of Object.values(appShortcut)) {
            appShortcutList.push(value);
        }
        this.state = {
            hotKeys: appShortcutList.join(','),
            appShortcut,
            config,
        };
    }

    onKeyUp(keyName, e, handle) {
        // console.log('App shortcut:onKeyUp', keyName, e, handle);
    }

    onKeyDown(keyName, e, handle) {
        // console.log('App shortcut:onKeyDown', keyName, e, handle);
        for (const [key, value] of Object.entries(this.state.appShortcut)) {
            let valueStr = value.replaceAll(' ', '');
            console.log(`${keyName}: ${valueStr}`);

            if (keyName.toString() == valueStr) {
                this.procressChange(key);
            }
        }
    }

    procressChange = (type: string) => {
        let updateObj = { ...this.state.config };
        const { setProjectConfig } = this.props;

        switch (type) {
            // case 'hover_tooggle':
            //     updateObj = { ...this.state.config, hover: this.state.config.hover ? false : true };

            //     break;

            case 'lint_tooggle':
                updateObj = { ...this.state.config, lint: this.state.config.lint ? false : true };

                break;

            case 'autocompletion_tooggle':
                updateObj = {
                    ...this.state.config,
                    autocompletion: this.state.config.autocompletion ? false : true,
                };

                break;

            default:
        }
        this.setState({ ...this.state, config: updateObj });
        setProjectConfig({
            code_editor: {
                ...updateObj,
            },
        });
    };

    render() {
        return (
            <Hotkeys
                keyName={this.state.hotKeys}
                onKeyDown={this.onKeyDown.bind(this)}
                onKeyUp={this.onKeyUp.bind(this)}
            ></Hotkeys>
        );
    }
}

export default connect(null, { setProjectConfig })(HotkeysComponent);
