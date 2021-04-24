import React, { Component } from 'react';
import {
    Text, View, StyleSheet, Image
} from 'react-native';

let config = require("../config/server.js");
let public_config = require("../config/public.js");

import AsyncStorage from '@react-native-community/async-storage';

export default class Intro extends Component {

  constructor(props) {

    super(props);

    this.state = {
      access_token: ""
    };
    this.init();
      
    this.styles = StyleSheet.create({
      container: {
        backgroundColor: "white",
        height: "100%",
        paddingTop: "50%"
      }, 
      
      logo: {
        alignSelf: "center",
        width: 130,
        height: 130
      },
        
      main_title: {
        textAlign: "center",
        color: "#fa7b3c",
        fontSize: 32,
        fontWeight: "bold",
        paddingTop: "10%"
      },
      
      sub_title: {
        textAlign: "center",
        color: "#fa7b3c",
        fontSize: 16
      } 
    });
  }

  async init() {

    // Get access token
    let access_token = await AsyncStorage.getItem('access_token');
    this.setState({access_token: access_token});

    config.socket.emit("register customer", {access_token: access_token});

    config.socket.on('notify user', (data) => public_config.notifications("Your order", data));
  }

  switchToNextStage() {
    fetch(config.getPath("api/users/checkValidAccessToken"), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: this.state.access_token
      })
    })
    .then((response) => response.json())
    .then(async (json) => {
      if (json.status == 1) {
        this.props.switchToLogin();
      }
      else if (json.status == 0) {
        this.props.switchToHomepage();
      }
    })
    .catch((error) => {
      //Error 
      console.log(error);
    });
  }

  render() {
    return (
      <View style={this.styles.container}
          onTouchStart={() => {this.switchToNextStage(); }}>
        <Image 
          style={this.styles.logo}
          source={require('../res/logo.png')}
        > 
        </Image>
        <Text style={this.styles.main_title}>
          SFCS
        </Text>
        <Text style={this.styles.sub_title}>
          Smart Food Court System
        </Text>
      </View>
    );
  }
}