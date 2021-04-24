import React, { Component } from 'react';
import {
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class CustomRightComponent extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <View style={{flexDirection: "row"}}>
        <Icon name="search" color="#fff" size={25} style={{marginLeft: 10}} onPress={() => this.props.showSearchBar()}/>
        <Icon name="shopping-cart" color="#fff" size={25} style={{marginLeft: 10}} onPress={() => {this.props.switchToCart(); }}/>
      </View>
    );
  }
}