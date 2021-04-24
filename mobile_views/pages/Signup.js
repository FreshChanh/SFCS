import React, { Component } from 'react';
import {
  Text, View, StyleSheet, Image, TextInput, Button, Alert
} from 'react-native';

let config = require("../config/server.js");
let public_config = require("../config/public.js");

export default class Signup extends Component {

  constructor(props) {
    super(props);

    this.state = {
      email: "",
      username: "",
      password: "",
      repassword: ""
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

  signUp() {
    // Check valid password

    if (this.state.password !== this.state.repassword) {
      public_config.createAlert("Your password and the retype are not matched!");
      return;
    }

    fetch(config.getPath("api/users/signup"), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: this.state.email,
        username: this.state.username,
        raw_password: this.state.password
      })
    })
    .then((response) => response.json())
    .then((json) => {
      if (json.status == 1) {
        public_config.createAlert("Your email has been existed in the system!");
      }
      else if (json.status == 2) {
        public_config.createAlert("Your username has been existed in the system!");
      }
      else if (json.status == 0) {
        this.props.switchToLogin();
      }
    })
    .catch((error) => {
      //Error 
      console.log(error);
    });
  }

  render() {
    return (
      <View style={this.styles.container}>
        <Image style={this.styles.logo} source={require('../res/logo.png')} > 
        </Image>
        <Text style={this.styles.loginTitle}>Đăng ký</Text>
        <View style={this.styles.loginForm}>
          <View style={this.styles.formControls}>
            <Text style={this.styles.formLabel} >Email</Text>
            <TextInput style={this.styles.formInput} placeholder="" onChangeText={(text) => this.setState({"email": text})}></TextInput>
          </View>

          <View style={this.styles.formControls}>
            <Text style={this.styles.formLabel} >Tên đăng nhập</Text>
            <TextInput style={this.styles.formInput} placeholder="" onChangeText={(text) => this.setState({"username": text})}></TextInput>
          </View>

          <View style={this.styles.formControls}>
            <Text style={this.styles.formLabel} >Mật khẩu</Text>
            <TextInput style={this.styles.formInput} placeholder="" secureTextEntry={true} onChangeText={(text) => this.setState({"password": text})}></TextInput>
          </View>

          <View style={this.styles.formControls}>
            <Text style={this.styles.formLabel} >Nhập lại mật khẩu</Text>
            <TextInput style={this.styles.formInput} placeholder="" secureTextEntry={true} onChangeText={(text) => this.setState({"repassword": text})}></TextInput>
          </View>
          
          <View style={this.styles.formControls}>
            <Button title="Đăng ký" color="#ed5151" onPress={() => { this.signUp(); }}></Button>
          </View>
          
        </View>
        
      </View>
    );
  }
}