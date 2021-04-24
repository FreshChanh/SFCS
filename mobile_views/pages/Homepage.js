import React, { Component } from 'react';
import {
  Text, View, Image, SafeAreaView, FlatList, TouchableWithoutFeedback  
} from 'react-native';
import {
    Header, SearchBar
} from 'react-native-elements';

import CustomRightComponent from './CustomRightComponent';

import AsyncStorage from '@react-native-community/async-storage';

let config = require("../config/server.js");
let public_config = require("../config/public.js");

export default class Homepage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      bestSellersData: [],
      salesOffData: [],
      access_token: "",
      current_notification: "",
      search: "",
      showSearchBar: false
    };

    this.searchBarRef = React.createRef();

    this.init();
  }

  async init() {
    // Get access token
    let access_token = await AsyncStorage.getItem('access_token');
    this.setState({access_token: access_token});
  }

  componentDidMount() {
    // Fetch best sellers data
    fetch(config.getPath("api/menu/bestsellers"), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((json) => {
      if (json.status == 1) {
        public_config.createAlert("Can't fetch best sellers data from server!");
      }
      else if (json.status == 0) {
        let bestSellersData = [];
        json.object.forEach((menu) => {
          bestSellersData.push({
            id: menu.id,
            name: menu.name,
            price: menu.price,
            image_path: config.getPath("public/" + menu.image_path)
          });
        });
        
        this.setState({bestSellersData: bestSellersData});
      }
    })
    .catch((error) => {
      //Error 
      console.log(error);
    });

    // Fetch salesoff data
    fetch(config.getPath("api/menu/salesoff"), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((json) => {
      if (json.status == 1) {
        public_config.createAlert("Can't fetch salesoff data from server!");
      }
      else if (json.status == 0) {
        let salesOffData = [];
        json.object.forEach((menu) => {
          salesOffData.push({
            id: menu.id,
            name: menu.name,
            price: menu.price,
            image_path: config.getPath("public/" + menu.image_path)
          });
        });
        
        this.setState({salesOffData: salesOffData});
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
        leftComponent={{ icon: 'menu', color: '#fff', size: 25, onPress: () => this.props.switchToMenuPage()}}
        centerComponent={{ text: 'SFCS', style: { color: '#fff', fontSize: 18} }}
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
        <View style={{backgroundColor: "white", flexDirection: "row", alignContent: 'stretch', paddingTop: 30}}>
          <TouchableWithoutFeedback onPress={() => this.props.switchToFood()}>
            <View style={{flex: 1, height: 100}}>
              <Image 
                style={{alignSelf: "center", width: 50, height: 50}}
                source={require('../res/food.png')}
              /> 
              <Text style={{textAlign: "center", fontWeight: "bold"}}>Food</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => this.props.switchToDrink()}>
            <View style={{flex: 1, height: 100}}>
              <Image 
                style={{alignSelf: "center", width: 50, height: 50}}
                source={require('../res/drink.png')}
              />
              <Text style={{textAlign: "center", fontWeight: "bold"}}>Drink</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => this.props.switchToFruit()}>
            <View style={{flex: 1, height: 100}}>
              <Image 
                style={{alignSelf: "center", width: 50, height: 50}}
                source={require('../res/fruit.png')}
              />
              <Text style={{textAlign: "center", fontWeight: "bold"}}>Vegetable</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>

        <View style={{backgroundColor: "white", 
                    marginTop: 15, 
                    paddingTop: 10
                    }}>
          <Text style={{fontWeight: "bold", fontSize: 18, marginLeft: 15}}>Best Sellers</Text>
          <SafeAreaView style={{marginTop: 10, paddingBottom: 10}}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={this.state.bestSellersData}
              renderItem={({item}) => {
                return (
                  <TouchableWithoutFeedback onPress={() => this.props.showDetails(item.id) }>
                    <View style={{marginLeft: 15}} >
                      <Image 
                        style={{width: 200, height: 130}}
                        source={{
                          uri: item.image_path,
                        }}
                      />
                      <Text style={{fontWeight: "bold", fontSize: 15}}>{item.name}</Text>
                      <Text style={{fontSize: 14, color: "#b8b4b4"}}>Price: {public_config.numberWithCommas(item.price) + " VND"}</Text>
                    </View>
                  </TouchableWithoutFeedback>
                );
              }}
              keyExtractor={item => item.id.toString()}
            />
          </SafeAreaView>
        </View>
        <View style={{backgroundColor: "white", 
                    marginTop: 15, 
                    paddingTop: 10
                    }}>
          <Text style={{fontWeight: "bold", fontSize: 18, marginLeft: 15}}>Sales Off</Text>
          <SafeAreaView style={{marginTop: 10, paddingBottom: 10}}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={this.state.salesOffData}
              renderItem={({item}) => {
                return (
                  <TouchableWithoutFeedback onPress={() => this.props.showDetails(item.id)}>
                    <View style={{marginLeft: 15}}>
                      <Image 
                        style={{width: 200, height: 130}}
                        source={{
                          uri: item.image_path,
                        }}
                      />
                      <Text style={{fontWeight: "bold", fontSize: 15}}>{item.name}</Text>
                      <Text style={{fontSize: 14, color: "#b8b4b4"}}>Price: {public_config.numberWithCommas(item.price) + " VND"}</Text>
                    </View>
                  </TouchableWithoutFeedback>  
                );
              }}
              keyExtractor={item => item.id.toString()}
            />
          </SafeAreaView>
        </View>
      </View>
    </View> 
    );
  }
}