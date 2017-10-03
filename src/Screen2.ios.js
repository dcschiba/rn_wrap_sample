import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Text,
  Button,
  Alert,
  TextInput,
} from 'react-native';
import RNFS from 'react-native-fs';

export default class Screen2 extends Component {
  constructor(props) {
    super(props);
    this.createFile = this.createFile.bind(this);
    this.readFile = this.readFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.state = { data: '' };
  }

  createFile() {
    fetch('https://pt-wrap01.wni.co.jp/WRAP/wrap-pri/data/WX_JP_Lightning_Latest/latest70min.json')
      .then((response) => response.json())
      .then((json) => {
        const path = RNFS.DocumentDirectoryPath + '/data.json';
        RNFS.writeFile(path, JSON.stringify(json), 'utf8')
          .then((success) => {
            Alert.alert('CREATE SUCCESS');
          })
          .catch((err) => {
            console.log(err.message);
          });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  readFile() {
    const path = RNFS.DocumentDirectoryPath + '/data.json';
    RNFS.readFile(path)
      .then((data) => {
        // console.log(data);
        this.setState({ data: data });
        Alert.alert('READ SUCCESS');
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  deleteFile() {
    const path = RNFS.DocumentDirectoryPath + '/data.json';
    RNFS.unlink(path)
      .then(() => {
        this.setState({ data: '' });
        Alert.alert('DELETE SUCCESS');
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  componentDidMount() {
    // Alert.alert('hello');
  }
  render() {
    const { data } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <Button onPress={this.createFile} title='ファイル書き込み' />
        <Button onPress={this.readFile} title='ファイル読み込み' />
        <Button onPress={this.deleteFile} title='ファイル削除' />
        <Text>{data}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});

AppRegistry.registerComponent('Screen2', () => Screen2);
