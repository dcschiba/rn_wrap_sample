import React, { Component } from 'react';
import {
  AppRegistry,
} from 'react-native';
import PushNotification from 'react-native-push-notification';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import Screen1 from './src/Screen1';
import Screen2 from './src/Screen2';

export default class rn_wrap_sample extends Component {
  componentDidMount() {
    PushNotification.configure({

      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log('TOKEN:', JSON.stringify(token));
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },

      // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: "164814975812",
    });
  }

  render() {
    return (
      <ScrollableTabView renderTabBar={() => <DefaultTabBar />}>
        <Screen1 tabLabel='WRAPJS' />
        <Screen2 tabLabel='OFFLINE' />
      </ScrollableTabView>
    );
  }
}

AppRegistry.registerComponent('rn_wrap_sample', () => rn_wrap_sample);
