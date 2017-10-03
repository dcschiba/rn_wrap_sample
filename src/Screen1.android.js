import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  WebView,
  Button,
} from 'react-native';

export default class Screen1 extends Component {
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
            style={{ flex: 1, marginTop: 5 }}
            source={{ uri: 'file:///android_asset/taf.html' }}
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
