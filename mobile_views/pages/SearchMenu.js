import React, { Component } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableWithoutFeedback, Image
} from 'react-native';

import {
    Header, SearchBar
} from 'react-native-elements';

let config = require("../config/server.js");
let public_config = require("../config/public.js");

const styles = StyleSheet.create({
  
});

export default class UserSetting extends Component {

  constructor(props) {
    super(props);
    this.state = {
      search: this.props.params,
      category: this.props.category,
      menuList: []
    }

    this.searchBarRef = React.createRef();
  }

  componentDidMount() {
    this.searchMenu();
  }

  updateSearch = (search) => {
    this.setState({search});
  }

  searchMenu() {
    // Search menu data
    fetch(config.getPath("api/menu/search"), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        params: this.state.search,
        category: this.state.category
      })
    })
    .then((response) => response.json())
    .then((json) => {

      if (json.status == 1) {
        public_config.createAlert("Can't search menu data from server!");
      }
      else if (json.status == 0) {
        let menuList = [];
        json.object.forEach((menu) => {
          menuList.push({
            id: menu.id,
            name: menu.name,
            price: menu.price,
            image_path: config.getPath("public/" + menu.image_path)
          });
        });
        
        this.setState({menuList: menuList});
      }
    })
    .catch((error) => {
      //Error 
      console.log(error);
    });
  }

  render() {

    const {search} = this.state;

    let body = <View></View>
    if (this.state.menuList.length == 0) {
      body = <Text style={{textAlign: "center", marginTop: 20, fontSize: 20}}>No results found</Text>
    }
    else {
      body = <SafeAreaView style={{marginTop: 10}}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={this.state.menuList}
        style={{paddingBottom: 20}}
        renderItem={({item}) => {
          return (
            <TouchableWithoutFeedback onPress={() => {this.props.showDetails(item.id); }}>
              <View style={{marginLeft: 10, marginRight: 10, marginBottom: 20, backgroundColor: "white", flexDirection: "row"}}>
                <Image 
                  style={{width: "50%", height: 150}}
                  source={{
                    uri: item.image_path,
                  }}
                />
                <View style={{width: "50%"}}>
                  <Text style={{textAlign: "center", fontSize: 20, fontWeight: "bold", marginTop: "27%"}}>{item.name}</Text>
                  <Text style={{textAlign: "center", fontSize: 15, color: "#b8b4b4"}}>{public_config.numberWithCommas(item.price) + " VND"}</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          );
        }}
        keyExtractor={item => item.id.toString()}
      />
      </SafeAreaView>
    }

    return (
    <View>
      <SearchBar 
        ref={searchBarRef => this.searchBarRef = searchBarRef}
        placeholder="What do you want..."
        platform="android"
        onChangeText={this.updateSearch}
        onSubmitEditing={() => this.searchMenu() }
        onClear={() => this.props.switchToHomepage()}
        onCancel={() => this.props.switchToHomepage()}
        value={search}
      />
      <View>
        {body}
      </View>
    </View> 
    );
  }
}