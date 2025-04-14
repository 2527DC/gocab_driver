import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Platform, PermissionsAndroid } from 'react-native';
import * as colors from '../assets/css/Colors';
import { bold, location_enable } from '../config/Constants';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import strings from "../languages/strings.js";

const LocationEnable = () => {

  const navigation = useNavigation();

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Access Required',
          message: 'This app needs to access your location for GPS functionality',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    return true; // iOS handled separately if needed
  }
};

  const enable_gps = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      alert(strings.please_try_again_once);
      return;
    }
  
    Geolocation.getCurrentPosition(
      async (position) => {
        navigation.navigate('Splash');
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert(strings.please_try_again_once);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000,
      }
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height:'100%',width: '100%', justifyContent:'center'}}>
        <View style={{ height:250 }}>
          <LottieView style={{ flex:1 }} source={location_enable} autoPlay loop />
        </View>
        <View style={{ margin:10}} />
        <View style={{alignItems: 'center', justifyContent:'center', margin: 10}}>
          <Text style={{fontFamily:bold, fontSize:18, color:colors.green,}}>{strings.please_allow} {global.app_name} {strings.to_enable_your_gps_for_accurate_pickup}</Text>
        </View>
        <View style={{ margin:20}} /> 
        <TouchableOpacity onPress={enable_gps.bind(this)} style={styles.button}>
          <Text style={{ color:colors.theme_fg_three, fontFamily:bold}}>{strings.enable_gps}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>  
  )
}

const styles = StyleSheet.create({
  container: {
    flex:1,
  },
  button: {
    padding:10,
    borderRadius: 10,
    margin:10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:colors.theme_bg
  },
});

export default LocationEnable;
