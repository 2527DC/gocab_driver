import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Platform, PermissionsAndroid, Linking } from 'react-native';
import * as colors from '../assets/css/Colors';
import { bold, location_enable } from '../config/Constants';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import strings from "../languages/strings.js";
import { promptForEnableLocationIfNeeded, isLocationEnabled } from 'react-native-android-location-enabler';  // Importing the necessary methods

const LocationEnable = () => {
  const navigation = useNavigation();

  const requestLocationPermission = async () => {
    console.log("inside the permission");

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs to access your location for GPS functionality',
          },
        );
        console.log("this is the grant", granted);

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
    console.log("button pressed");

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      alert(strings.please_try_again_once);
      return;
    }

    // ✅ Permission is granted — proceed to check and enable location
    try {
      // Handle platform-specific logic
      if (Platform.OS === 'android') {
        const isEnabled = await isLocationEnabled();

        if (!isEnabled) {
          // If location is not enabled, prompt the user to enable it
          const result = await promptForEnableLocationIfNeeded({
            interval: 10000,
            waitForAccurate: true, // Optional: Wait for accurate location
          });

          if (result === 'enabled') {
            console.log("GPS enabled, navigating to CheckPhone screen");
            navigation.navigate('CheckPhone'); // Replace 'CheckPhone' with your target screen's name
          }
        } else {
          // Location is already enabled, navigate to the other screen directly
          console.log("Location already enabled, navigating to CheckPhone screen");
          navigation.navigate('CheckPhone'); // Replace 'CheckPhone' with your target screen's name
        }
      } else if (Platform.OS === 'ios') {
        // For iOS, we cannot enable location directly, so we guide the user to the settings
        alert(strings.enable_location_from_settings);

        // Open app settings directly (user needs to enable location manually)
        Linking.openURL('app-settings:');
      }
    } catch (enableErr) {
      console.log("Error enabling GPS:", enableErr);
      alert(strings.please_try_again_once);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: '100%', width: '100%', justifyContent: 'center' }}>
        <View style={{ height: 250 }}>
          <LottieView style={{ flex: 1 }} source={location_enable} autoPlay loop />
        </View>
        <View style={{ margin: 10 }} />
        <View style={{ alignItems: 'center', justifyContent: 'center', margin: 10 }}>
          <Text style={{ fontFamily: bold, fontSize: 18, color: colors.green }}>
            {strings.please_allow} {global.app_name} {strings.to_enable_your_gps_for_accurate_pickup}
          </Text>
        </View>
        <View style={{ margin: 20 }} />
        <TouchableOpacity onPress={enable_gps} style={styles.button}>
          <Text style={{ color: colors.theme_fg_three, fontFamily: bold }}>
            {strings.enable_gps}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    padding: 10,
    borderRadius: 10,
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.theme_bg,
  },
});

export default LocationEnable;
