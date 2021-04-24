import React, { Component } from 'react';
import {
  View, Text, StyleSheet, TextInput
} from 'react-native';

import {
  Header, CheckBox, Button
} from 'react-native-elements'; 

import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-community/async-storage';

let config = require("../config/server.js");
let public_config = require("../config/public.js");

const styles = StyleSheet.create({
  formInput: {
    height: 40,
    borderBottomWidth: 0.3
  },

  formLabel: {
    fontWeight: "bold",
    fontSize: 16
  },
});

export default class UserSetting extends Component {

  constructor(props) {
    super(props);

    this.state = {
      access_token: "",
      username: "",
      email: "",
      password: "",
      password_retype: "",
      gender: 0,
      address: ""
    }

    this.init();
  }

  async init() {

    // Get access token
    let access_token = await AsyncStorage.getItem('access_token');
    this.setState({access_token: access_token});

    // Fetch member data

    fetch(config.getPath("api/users/getMemberData"), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({access_token: this.state.access_token})
    })
    .then((response) => response.json())
    .then(async (json) => {
      if (json.status == 1) {
        public_config.createAlert("Can't get your data");
      }
      else if (json.status == 0) {
        this.setState({
          username: json.member.username, 
          email: json.member.email,
          gender: json.member.gender,
          address: json.member.address
        });
      }
    })
    .catch((error) => {
      //Error 
      console.log(error);
    });
  }

  saveChanges() {

    // Save changes
    if (this.state.password !== this.state.password_retype) {
      public_config.createAlert("The password and the retype must be the same !");
      return;
    }

    fetch(config.getPath("api/users/updateCustomerData"), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state)
    })
    .then((response) => response.json())
    .then((json) => {

      if (json.status == 1) {
        public_config.createAlert("Can't update your data from server!");
      }
      else if (json.status == 0) {
        this.props.switchToMenu();
      }
    })
    .catch((error) => {
      //Error 
      console.log(error);
    });
  }

  render() {
    return (
    <View>
      <Header
        leftComponent={{ icon: 'chevron-left', color: "#fff", onPress: () => this.props.switchToMenu()}}
        centerComponent={{ text: "User Settings", style: { color: "#fff", fontSize: 18} }}
        backgroundColor="#fa7b3c"
      />
      <View>
        <View style={{padding: 10}}>
          <Text style={styles.formLabel}>Username</Text>
          <TextInput 
            style={styles.formInput} 
            defaultValue={this.state.username}
            editable={false}
          />
        </View>
        <View style={{padding: 10}}>
          <Text style={styles.formLabel}>Email</Text>
          <TextInput 
            style={styles.formInput} 
            placeholder="Your email"
            defaultValue={this.state.email}
            onChangeText={(text) => this.setState({email: text}) }
          />
        </View>
        <View style={{padding: 10}}>
          <Text style={styles.formLabel}>Password</Text>
          <TextInput 
            style={styles.formInput} 
            placeholder="Your password"
            defaultValue={this.state.password}
            secureTextEntry={true}
            onChangeText={(text) => this.setState({password: text}) }
          />
        </View>
        <View style={{padding: 10}}>
          <Text style={styles.formLabel}>Retype your password</Text>
          <TextInput 
            style={styles.formInput} 
            placeholder="Your retype password"
            defaultValue={this.state.password_retype}
            secureTextEntry={true}
            onChangeText={(text) => this.setState({password_retype: text}) }
          />
        </View>
        <View style={{padding: 10, flexDirection: "row"}}>
          <CheckBox
            title='Male'
            checkedIcon='dot-circle-o'
            uncheckedIcon='circle-o'
            checked={this.state.gender == 0 ? true : false}
            onPress={() => this.setState({gender: 1 - this.state.gender})}
          />
          <CheckBox
            title='Female'
            checkedIcon='dot-circle-o'
            uncheckedIcon='circle-o'
            checked={this.state.gender == 1 ? true : false}
            onPress={() => this.setState({gender: 1 - this.state.gender})}
          />
        </View>
        <View style={{padding: 10}}>
          <Text style={styles.formLabel}>Address</Text>
          <TextInput 
            style={styles.formInput} 
            placeholder="Your address here"
            defaultValue={this.state.address}
            onChangeText={(text) => this.setState({address: text}) }
          />
        </View>
        <View style={{marginLeft: 20, marginRight: 20}}>
          <Button onPress={async () => this.saveChanges()} title="Save changes" buttonStyle={{backgroundColor: "#db4737"}}/>
        </View>
      </View>
    </View> 
    );
  }
}