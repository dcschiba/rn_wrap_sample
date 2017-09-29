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
} from 'react-native';

export default class rn_wrap_sample extends Component {
  tafOn() {
    mapview.postMessage('tafOn');
  }
  tafOff() {
    mapview.postMessage('tafOff');
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Button onPress={this.tafOn} title='ON' />
        <Button onPress={this.tafOff} title='OFF' />
        <WebView
          style={{ flex: 1, marginTop: 20 }}
          source={{ uri: 'file:///android_asset/taf.html' }}
          ref={webview => {mapview = webview;}}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: 400,
    width: 400,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

AppRegistry.registerComponent('rn_wrap_sample', () => rn_wrap_sample);
