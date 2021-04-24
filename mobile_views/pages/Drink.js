import React, { Component } from 'react';
import {
  Text, View, Image, SafeAreaView, FlatList, TouchableWithoutFeedback
} from 'react-native';
import {
    Header, SearchBar
} from 'react-native-elements';

let config = require("../config/server.js");
let public_config = require("../config/public.js");

import CustomRightComponent from './CustomRightComponent';

export default class Drink extends Component {

  constructor(props) {
    super(props);
    this.state = {
      menuList: [],
      search: "",
      showSearchBar: false
    };

    this.searchBarRef = React.createRef();
  }

  componentDidMount() {
    // Fetch drink data
    fetch(config.getPath("api/menu/drink"), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((json) => {
      if (json.status == 1) {
        public_config.createAlert("Can't fetch drink data from server!");
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

  componentDidUpdate() {
    if (this.state.showSearchBar) {
      this.searchBarRef.focus();
    }
  }

  updateSearch = (search) => {
    this.setState({search});
  }

  render() {

    const {search} = this.state;

    let header = <View></View>;
    if (this.state.showSearchBar) {
      header = <SearchBar 
        ref={searchBarRef => this.searchBarRef = searchBarRef}
        placeholder="Type Here..."
        platform="android"
        onChangeText={this.updateSearch}
        onSubmitEditing={() => this.props.searchMenu(this.state.search) }
        onClear={() => this.setState({showSearchBar: false})}
        onCancel={() => this.setState({showSearchBar: false})}
        value={search}
      />
    }
    else {
      header = <Header
        leftComponent={{ icon: 'chevron-left', color: '#fff', onPress: () => {this.props.switchToHomepage(); }}}
        centerComponent={{ text: 'DRINK', style: { color: '#fff', fontSize: 18} }}
        rightComponent={
        <CustomRightComponent 
          switchToCart={() => this.props.switchToCart()}
          showSearchBar={() => this.setState({showSearchBar: true})}
        />}
        backgroundColor="#fa7b3c"
      />
    }

    return (
    <View>
      {header}
      <View>
        <SafeAreaView style={{marginTop: 10}}>
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
      </View>
    </View> 
    );
  }
}