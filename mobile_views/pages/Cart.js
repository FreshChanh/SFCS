import React, { Component } from 'react';
import {
  View, Text, Image, SafeAreaView, FlatList
} from 'react-native';

import {
  Header, Button
} from 'react-native-elements'; 

import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-community/async-storage';

let config = require("../config/server.js");
let public_config = require("../config/public.js");

export default class Cart extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      access_token: "",
      cartsList: []
    };

    this.getAccessToken();
    this.getCartsList();
  }

  async getAccessToken() {
    let access_token = await AsyncStorage.getItem('access_token');
    this.setState({access_token: access_token});    
  }

  async getCartsList() {
    let cartsList = await AsyncStorage.getItem('current_carts');
    if (cartsList !== null) {
      cartsList = JSON.parse(cartsList);
      this.setState({cartsList: cartsList});
    }
  }

  componentDidMount() {

  }

  calculateTotalCost() {
    let result = 0;
    this.state.cartsList.forEach((item) => {
      result += item.menu_price * item.menu_count;
    });
    return result;
  }

  async decreaseItem(menu) {
    await public_config.addToCart({
      menu_id: menu.menu_id,
      menu_title: menu.menu_title,
      menu_image_path: menu.menu_image_path,
      menu_price: menu.menu_price
    }, -1);

    await this.getCartsList();
  }

  async increaseItem(menu) {
    await public_config.addToCart({
      menu_id: menu.menu_id,
      menu_title: menu.menu_title,
      menu_image_path: menu.menu_image_path,
      menu_price: menu.menu_price
    }, 1);

    await this.getCartsList();
  }

  async removeItem(menu) {
    await public_config.addToCart({
      menu_id: menu.menu_id,
      menu_title: menu.menu_title,
      menu_image_path: menu.menu_image_path,
      menu_price: menu.menu_price
    }, -menu.menu_count);

    await this.getCartsList();
  }

  async orderButton() {
    await this.getCartsList();
    if (this.state.cartsList.length == 0) {
      public_config.createAlert("Can't order an empty cart");
    }
    else {
      fetch(config.getPath("api/orders/add"), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.state)
      })
      .then((response) => response.json())
      .then(async (json) => {
        if (json.status == 1) {
          public_config.createAlert("Can't order this cart");
        }
        else if (json.status == 0) {
          config.socket.emit('orders to cook', {access_token: this.state.access_token, order_code: json.order_code});
          await AsyncStorage.removeItem("current_carts");
          this.props.switchToHomepage();
        }
      })
      .catch((error) => {
        //Error 
        console.log(error);
      });
    }
  }
  
  render() {
    if (this.state.cartsList.length != 0) {
      return (
        <View>
          <Header
            leftComponent={{ icon: 'chevron-left', color: '#fff', onPress: () => {this.props.switchToHomepage(); }}}
            centerComponent={{ text: 'YOUR CART', style: { color: '#fff', fontSize: 18} }}
            backgroundColor="#fa7b3c"
          />
          <View>
            <SafeAreaView>
              <FlatList
                showsVerticalScrollIndicator={false}
                data={this.state.cartsList}
                style={{paddingBottom: 20}}
                renderItem={({item}) => {
                  return (
                    <View style={{marginLeft: 10, marginRight: 10, marginTop: 35, flexDirection: "row"}}>
                      <Image 
                        style={{width: "25%", height: 75}}
                        source={{
                          uri: config.getPath("public/" + item.menu_image_path),
                        }}
                      />
                      <View style={{width: "30%", height: 75, marginLeft: 10}}>
                        <Text style={{fontSize: 20}}>{item.menu_title}</Text>
                        <Text onPress={async () => { await this.removeItem(item); } }style={{fontSize: 18, color: "blue"}}>Remove</Text>
                      </View>
                      
                      <View style={{width: "45%", height: 75}}>
                        <Text style={{textAlign: "right", fontSize: 20, fontWeight: "bold", marginBottom: 10, marginRight: 10}}>{public_config.numberWithCommas(item.menu_price) + " VND"}</Text>
                        <View style={{flexDirection: "row", justifyContent: "flex-end", marginRight: 10}}>
                          <Button onPress={async () => { await this.decreaseItem(item); }} title="-" titleStyle={{fontSize: 25}} buttonStyle={{height: 40, width: 40, backgroundColor: "#db4737"}}/>
                          <Text style={{width: 40, textAlign: "center", textAlignVertical: "center", fontSize: 18}}>{item.menu_count}</Text>  
                          <Button onPress={async () => { await this.increaseItem(item); }} title="+" titleStyle={{fontSize: 25}} buttonStyle={{height: 40, width: 40, backgroundColor: "#db4737"}}/>
                        </View>
                      </View>
                    </View>
                  );
                }}
                keyExtractor={item => item.menu_id.toString()}
              />
              <View>
                <Text style={{fontWeight: "bold", fontSize: 20, textAlign: "right", marginRight: 10}}>
                  Total: {public_config.numberWithCommas(this.calculateTotalCost()) + " VND"}
                </Text>
                <Button title="Order" titleStyle={{fontSize: 20}} buttonStyle={{backgroundColor: "#db4737", marginTop: 20, width: "90%", alignSelf: "center"}} onPress={async () => await this.orderButton()}/>
              </View>
            </SafeAreaView>
          </View>
        </View>
      );
    }
    else {
      return (
        <View>
          <Header
            leftComponent={{ icon: 'chevron-left', color: '#fff', onPress: () => {this.props.switchToHomepage(); }}}
            centerComponent={{ text: 'YOUR CART', style: { color: '#fff', fontSize: 18} }}
            backgroundColor="#fa7b3c"
          />
          <View>
            <Text style={{textAlign: "center", marginTop: 20, fontSize: 20}}>Your cart is empty</Text>
          </View>
        </View>
      );
    }
  }
}