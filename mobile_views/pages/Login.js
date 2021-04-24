import React, { Component } from 'react';
import {
  Text, View, StyleSheet, Image, TextInput, Button, Alert
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

let config = require("../config/server.js");
let public_config = require("../config/public.js");

export default class Login extends Component {

  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: ""
    };

    this.styles = StyleSheet.create({
      container: {
        backgroundColor: "white",
        height: "100%",
        paddingTop: "20%"
      }, 
      
      logo: {
        alignSelf: "center",
        width: 130,
        height: 130
      },

      loginTitle: {
        alignSelf: "center",
        fontWeight: "bold",
        fontSize: 32,
        color: "#ed5151"
      },

      loginForm: {
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 20
      },

      formControls: {
        paddingTop: 15
      },

      formLabel: {
        fontWeight: "bold",
        fontSize: 16
      },

      formInput: {
        height: 40,
        borderBottomWidth: 0.3
      },

      footerForm: {
        paddingTop: 20
      },

      footerFormLabel: {
        textAlign: "center",
        color: "gray"
      }
    });
  }

  logIn() {
    // Check valid password

    fetch(config.getPath("api/users/login"), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      })
    })
    .then((response) => response.json())
    .then(async (json) => {
      if (json.status == 1) {
        public_config.createAlert("Your username or password is not valid!");
      }
      else if (json.status == 0) {
        await this.setAccessToken(json.access_token);
        config.socket.emit("register customer", {access_token: json.access_token});
        this.props.switchToHomepage();
      }
    })
    .catch((error) => {
      //Error 
      console.log(error);
    });
  }

  async setAccessToken(access_token) {
    await AsyncStorage.setItem("access_token", access_token);
  }

  render() {
    return (
      <View style={this.styles.container}>
        <Image style={this.styles.logo} source={require('../res/logo.png')} > 
        </Image>
        <Text style={this.styles.loginTitle}>Đăng nhập</Text>
        <View style={this.styles.loginForm}>
          <View style={this.styles.formControls}>
            <Text style={this.styles.formLabel} >Tên đăng nhập</Text>
            <TextInput style={this.styles.formInput} placeholder="Nguyễn Văn A ?" onChangeText={(text) => this.setState({"username": text})}></TextInput>
          </View>

          <View style={this.styles.formControls}>
            <Text style={this.styles.formLabel} >Mật khẩu</Text>
            <TextInput style={this.styles.formInput} placeholder="Mật khẩu của bạn là ..." secureTextEntry={true} onChangeText={(text) => this.setState({"password": text})}></TextInput>
          </View>
          
          <View style={this.styles.formControls}>
            <Button title="Đăng nhập" color="#ed5151" onPress={() => {this.logIn();}}></Button>
          </View>
          
        </View>

        <View style={this.styles.footerForm}>
          <Text style={this.styles.footerFormLabel} onPress={() => {console.log("Quen mat khau"); }}>Quên mật khẩu? </Text>
          <Text style={this.styles.footerFormLabel} onPress={() => {this.props.switchToSignup(); }} >Bạn chưa có tài khoản? Đăng ký ngay !</Text>
        </View>
        
      </View>
    );
  }
}