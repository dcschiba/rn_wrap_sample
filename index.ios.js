/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  WebView,
  Button,
  Text,
} from 'react-native';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import Screen1 from './src/Screen1';
import Screen2 from './src/Screen2';

export default class rn_wrap_sample extends Component {
  render() {
    return (
      <ScrollableTabView renderTabBar={() => <DefaultTabBar />}>
        <Screen1 tabLabel='WRAPJS' />
        <Screen2 tabLabel='OFFLINE' />
      </ScrollableTabView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});

AppRegistry.registerComponent('rn_wrap_sample', () => rn_wrap_sample);
