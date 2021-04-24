import {
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

var PushNotification = require('react-native-push-notification');

PushNotification.configure({

    onRegister: function(token) {
        console.log('TOKEN:', token);
    },

    onNotification: function(notification) {
        console.log('NOTIFICATION:', notification);
    },

    popInitialNotification: true,
    requestPermissions: true,
});

exports.numberWithCommas = function(x) {
    if (x)
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return "";
}

exports.createAlert = function(message) {
    return Alert.alert(
        "Warning",
        message,
        [
            {text: "OK", onPress: () => {}}
        ],
        {cancelable: false}
    );
}

exports.addToCart = async function(menu, menu_count) {
    if (menu_count == 0) {
        exports.createAlert("Only can add to the cart a positive number");
        return -1;
    }
    
    let currentCart = await AsyncStorage.getItem("current_carts");
    if (currentCart == null) {
        currentCart = [];
    }
    else {
        currentCart = JSON.parse(currentCart);
    }
  
    let existed = false;
    for (let i = 0; i < currentCart.length; ++i) {
        if (currentCart[i].menu_id == menu.menu_id) {
            currentCart[i].menu_count += menu_count;
            if (currentCart[i].menu_count == 0) {
                currentCart.splice(i, 1);
            }
            existed = true;
            break;
        }
    }
  
    if (!existed) {
        currentCart.push({
            menu_id: menu.menu_id,
            menu_title: menu.menu_title,
            menu_image_path: menu.menu_image_path,
            menu_price: menu.menu_price,
            menu_count: menu_count
        });
    }
    await AsyncStorage.setItem("current_carts", JSON.stringify(currentCart));
    return 0;
}

exports.notifications = function(title, content) {
    PushNotification.localNotification({
        "title": title,
        "message": content
    });
}