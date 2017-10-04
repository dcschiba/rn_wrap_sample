import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  WebView,
  Button,
  Vibration,
} from 'react-native';

export default class Screen1 extends Component {
  tafOn() {
    mapview.postMessage('tafOn');
    Vibration.vibrate();
  }
  tafOff() {
    mapview.postMessage('tafOff');
    Vibration.vibrate();
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Button onPress={this.tafOn} title='ON' />
        <Button onPress={this.tafOff} title='OFF' />
        <WebView
          style={{ flex: 1, marginTop: 5 }}
          source={{ uri: 'https://pt-wrap01.wni.co.jp/WRAP/hist-data/mobile/rn/webview/taf.html' }}
          ref={webview => { mapview = webview; }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});

AppRegistry.registerComponent('Screen1', () => Screen1);
