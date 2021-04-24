import React, { Component } from 'react';
import Intro from './pages/Intro';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Homepage from './pages/Homepage';
import Food from './pages/Food';
import Drink from './pages/Drink';
import Fruit from './pages/Fruit';
import MenuDetails from './pages/MenuDetails';
import Cart from './pages/Cart';
import Menu from './pages/Menu';
import UserSetting from './pages/UserSetting';
import SearchMenu from './pages/SearchMenu'

export default class App extends Component {

  constructor() {
    super();
    this.state = {
      currentScene: "intro",
      searchParams: "",
      searchCategory: "",
      currentMenu: "",
      previousPage: ""
    };
  }

  render() {
    if (this.state.currentScene == "intro") {
      return (
        <Intro 
        switchToLogin={() => { this.setState({currentScene: "login"}); }}
        switchToHomepage={() => { this.setState({currentScene: "homepage"}); }}
        />
      );
    }
    else if (this.state.currentScene == "login") {
      return (
        <Login 
        switchToSignup={() => { this.setState({currentScene: "signup"}); }}
        switchToHomepage={() => { this.setState({currentScene: "homepage"}); }}
        />
      );
    }
    else if (this.state.currentScene == "signup") {
      return (
        <Signup switchToLogin={() => { this.setState({currentScene: "login"}); }}/>
      );
    }
    else if (this.state.currentScene == "homepage") {
      return (
        <Homepage
        switchToFood={() => { this.setState({currentScene: "food"}); }}
        switchToDrink={() => { this.setState({currentScene: "drink"}); }}
        switchToFruit={() => { this.setState({currentScene: "fruit"}); }}
        showDetails={(id) => {this.setState({currentScene: "menu_details", currentMenu: id, previousPage: "homepage"})}}
        switchToCart={() => {this.setState({currentScene: "cart"})}}
        switchToMenuPage={() => this.setState({currentScene: "menu"})}
        searchMenu={(params) => {
          this.setState({currentScene: "search", searchParams: params, searchCategory: "all"});
        }}
        />
      );
    }
    else if (this.state.currentScene == "food") {
      return (
        <Food 
        switchToHomepage={() => { this.setState({currentScene: "homepage"})}}
        showDetails={(id) => {this.setState({currentScene: "menu_details", currentMenu: id, previousPage: "food"})}}
        switchToCart={() => {this.setState({currentScene: "cart"})}}
        searchMenu={(params) => {
          this.setState({currentScene: "search", searchParams: params, searchCategory: "food"});
        }}
        />
      );
    }
    else if (this.state.currentScene == "drink") {
      return (
        <Drink 
        switchToHomepage={() => { this.setState({currentScene: "homepage"})}}
        showDetails={(id) => {this.setState({currentScene: "menu_details", currentMenu: id, previousPage: "drink"})}}
        switchToCart={() => {this.setState({currentScene: "cart"})}}
        searchMenu={(params) => {
          this.setState({currentScene: "search", searchParams: params, searchCategory: "drink"});
        }}
        />
      );
    }
    else if (this.state.currentScene == "fruit") {
      return (
        <Fruit 
        switchToHomepage={() => { this.setState({currentScene: "homepage"})}}
        showDetails={(id) => {this.setState({currentScene: "menu_details", currentMenu: id, previousPage: "fruit"})}}
        switchToCart={() => {this.setState({currentScene: "cart"})}}
        searchMenu={(params) => {
          this.setState({currentScene: "search", searchParams: params, searchCategory: "fruit"});
        }}
        />
      );
    }
    else if (this.state.currentScene == "menu_details") {
      return (
        <MenuDetails
        switchToHomepage={() => { this.setState({currentScene: "homepage"}) }}
        switchToLogin={() => { this.setState({currentScene: "login"}); }}
        switchToFood={() => { this.setState({currentScene: "food"}); }}
        switchToDrink={() => { this.setState({currentScene: "drink"}); }}
        switchToFruit={() => { this.setState({currentScene: "fruit"}); }}
        switchToCart={() => {this.setState({currentScene: "cart"})}}
        currentMenu={this.state.currentMenu}
        previousPage={this.state.previousPage}
        />
      );
    }
    else if (this.state.currentScene == "cart") {
      return (
        <Cart
        switchToHomepage={() => { this.setState({currentScene: "homepage"}); }}
        />
      );
    }
    else if (this.state.currentScene == "menu") {
      return (
        <Menu
        switchToHomepage={() => this.setState({currentScene: "homepage"})}
        switchToLogin={() => this.setState({currentScene: "login"}) }
        switchToUserSetting={() => this.setState({currentScene: "usersetting"})}
        />
      );
    }
    else if (this.state.currentScene == "usersetting") {
      return (
        <UserSetting
        switchToMenu={() => this.setState({currentScene: "menu"})}
        />
      );
    }
    else if (this.state.currentScene == "search") {
      return (
        <SearchMenu 
          params={this.state.searchParams}
          category={this.state.searchCategory}
          switchToHomepage={() => this.setState({currentScene: "homepage"})}
          showDetails={(id) => {this.setState({currentScene: "menu_details", currentMenu: id, previousPage: "homepage"})}}
        />
      );
    }
    else {
      return (
        <></>
      );
    }
  }
}