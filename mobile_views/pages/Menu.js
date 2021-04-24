import React, { Component } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList
} from 'react-native';

import {
  Header, Button, ThemeConsumer
} from 'react-native-elements'; 

import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-community/async-storage';

let config = require("../config/server.js");
let public_config = require("../config/public.js");

const styles = StyleSheet.create({
  sectionHeader: {
    marginLeft: 10,
    marginBottom: 5,
    color: "#b8b8b8"
  },

  sectionBody: {
    backgroundColor: "#fff",
    padding: 20,
    flexDirection: "row"  
  },

  username: {
    fontSize: 25
  },

  email: {
    color: "#b8b8b8"
  },

  order: {
    marginBottom: 15
  }, 

  orderTitle: {
    fontSize: 20
  },

  orderDescription: {
    color: "#b8b8b8"
  }
});

export default class Menu extends Component {

  constructor(props) {
    super(props);

    this.state = {
      access_token: "",
      username: "",
      email: "",
      ordersList: []
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
        this.setState({username: json.member.username, email: json.member.email});
      }
    })
    .catch((error) => {
      //Error 
      console.log(error);
    });

    // Fetch orders data

    fetch(config.getPath("api/orders/getOrderData"), {
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
        public_config.createAlert("Can't get your orders data");
      }
      else if (json.status == 0) {
        this.setState({ordersList: json.ordersList});
        console.log(json.ordersList[0]);
      }
    })
    .catch((error) => {
      //Error 
      console.log(error);
    });
  }

  async logOut() {
    fetch(config.getPath("api/users/logout"), {
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
        public_config.createAlert("Can't logout");
      }
      else if (json.status == 0) {
        await AsyncStorage.removeItem("access_token");
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
    <View>
      <Header
        leftComponent={{ icon: 'chevron-left', color: "#fff", onPress: () => this.props.switchToHomepage()}}
        centerComponent={{ text: "Settings", style: { color: "#fff", fontSize: 18} }}
        backgroundColor="#fa7b3c"
      />
      <View style={{marginTop: 20}}>
        <Text style={styles.sectionHeader}>YOUR INFORMATION</Text>
        <View style={styles.sectionBody}>
          <View style={{width: "90%"}}>
           <Text style={styles.username}>{this.state.username}</Text>
           <Text style={styles.email}>{this.state.email}</Text>
          </View>
          <View style={{width: "10%", alignSelf: "center"}}>
            <Button onPress={() => this.props.switchToUserSetting()} icon={<Icon name="angle-right" size={25} color="black"/>} type="clear"/>
          </View>
        </View>
      </View>
      
      <View style={{marginTop: 20}}>
        <Text style={styles.sectionHeader}>ORDERS HISTORY</Text>
        <View style={styles.sectionBody}>
          <SafeAreaView>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={this.state.ordersList}
              renderItem={({item}) => {
                return (
                  <View style={styles.order}>
                    <Text style={styles.orderTitle}>{item.order_code}</Text>
                    <Text style={styles.orderDescription}>Total Cost: {public_config.numberWithCommas(item.totalCost)} VND</Text>
                    <Text style={styles.orderDescription}>Status: {item.status == 0 ? "New Order" : item.status == 1 ? "Processing Order" : "Finished Order"}</Text>
                    <Text style={styles.orderDescription}>Created date: {(new Date(item.created_date)).toLocaleDateString()}</Text>
                  </View>
                );
              }}
              keyExtractor={item => item.id.toString()}
            />
          </SafeAreaView>
        </View>
      </View>

      <View style={{marginLeft: 20, marginRight: 20}}>
        <Button onPress={async () => this.logOut()} icon={<Icon name="sign-out" size={25} color="white"/>} title="Logout" buttonStyle={{backgroundColor: "#db4737"}}/>
      </View>

    </View> 
    );
  }
}