/**
 * @format
 */

import {AppRegistry} from 'react-native';
//import App from './App';
import Root from "./src/main";
import {name as appName} from './app.json';

import Icon from 'react-native-vector-icons/FontAwesome';

Icon.loadFont();

import Icon2 from 'react-native-vector-icons/MaterialIcons';
Icon2.loadFont();


AppRegistry.registerComponent(appName, () => Root);
