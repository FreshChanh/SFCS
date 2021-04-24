import React, { Component } from 'react';
import {
  View, Text, Image
} from 'react-native';

import {
  Header, Button
} from 'react-native-elements'; 

import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-community/async-storage';

import CustomRightComponent from './CustomRightComponent';

let config = require("../config/server.js");
let public_config = require("../config/public.js");

export default class MenuDetails extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      details: {},
      titleColor: "#fff",
      barColor: "#fff",
      barButtonColor: "#fff",
      cartNumber: "",
      access_token: ""
    };

    this.getAccessToken();
  }

  async getAccessToken() {
    let access_token = await AsyncStorage.getItem('access_token');
    this.setState({access_token: access_token});
  }

  componentDidMount() {
      // Fetch best sellers data
    fetch(config.getPath(`api/menu/details/${this.props.currentMenu}`), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((json) => {
      if (json.status == 1) {
        public_config.createAlert("Can't fetch details from server!");
      }
      else if (json.status == 0) {
        this.setState({details: json});
      }
    })
    .then(() => {
      if (this.state.details.type == 1){
        this.setState({titleColor: "#db4737", barColor: "#fff"});
        this.setState({barButtonColor: this.state.titleColor});
      }
      else if (this.state.details.type == 2){
        this.setState({titleColor: "#7689cc", barColor: "#fff"});
        this.setState({barButtonColor: this.state.titleColor});
      }
      else {
        this.setState({titleColor: "#83cc76", barColor: "#fff"});
        this.setState({barButtonColor: this.state.titleColor});
      } 
      this.setState({cartNumber: 0});
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
          leftComponent={{ icon: 'chevron-left', color: `${this.state.barButtonColor}`, onPress: () => {
            if (this.props.previousPage == "homepage")
              this.props.switchToHomepage();
            else if (this.props.previousPage == "food")
              this.props.switchToFood();
            else if (this.props.previousPage == "drink")
              this.props.switchToDrink();
            else if (this.props.previousPage == "fruit")
              this.props.switchToFruit();
          }}}
          centerComponent={{ text: this.state.details.name, style: { color: this.state.titleColor, fontSize: 18} }}
          rightComponent={<CustomRightComponent buttonColor={this.state.barButtonColor} switchToCart={() => {this.props.switchToCart(); }}/>}
          backgroundColor={this.state.barColor}
        />
        <View>
          <Image 
            style={{alignSelf: "center", width: "100%", height: 200}}
            source={{
              uri: config.getPath("public/" +this.state.details.image_path)
            }}
          /> 
          <View style={{marginLeft: 10, marginTop: 10}}>
            <Text style={{fontWeight: "bold", fontSize: 24}}>
              {this.state.details.name}
            </Text>
            <Text style={{color: this.state.titleColor, fontSize: 18, marginTop: 5}}>
              <Text style={{fontWeight: "bold"}}>Price: </Text> 
              {public_config.numberWithCommas(this.state.details.price) + " VND"}
            </Text>
            <Text style={{fontSize: 17, marginTop: 5, color: "#65686e"}}>
              {this.state.details.description}
            </Text>
            <View style={{flexDirection: "row", marginTop: 20}}>
              <Button onPress={() => { this.decreaseCart(); }} title="-" titleStyle={{fontSize: 25}} buttonStyle={{height: 40, width: 40, backgroundColor: this.state.barButtonColor}}/>
              <Text style={{width: 50, textAlign: "center", textAlignVertical: "center", fontSize: 18}}>{this.state.cartNumber}</Text>  
              <Button onPress={() => { this.increaseCart(); }} title="+" titleStyle={{fontSize: 25}} buttonStyle={{height: 40, width: 40, backgroundColor: this.state.barButtonColor}}/>
              <Button onPress={async () => { await this.addToCart(); }}icon={<Icon name="cart-plus" size={25} color="white"/>} buttonStyle={{marginLeft: 10, height: 40, width: 40, backgroundColor: this.state.barButtonColor}}/>
            </View>
          </View>
          
        </View>
      </View>
    );
  }

  decreaseCart() {
    if (this.state.cartNumber > 0) {
      this.setState({cartNumber: this.state.cartNumber - 1});
    }
  }

  increaseCart() {
    this.setState({cartNumber: this.state.cartNumber + 1});
  }

  async addToCart() {
    
    let status = await public_config.addToCart({
      menu_id: this.state.details.id,
      menu_title: this.state.details.name,
      menu_image_path: this.state.details.image_path,
      menu_price: this.state.details.price
    }, this.state.cartNumber);

    if (status == 0)
      this.props.switchToHomepage();
    
  }
}