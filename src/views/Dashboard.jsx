// Updated React Native Dashboard Screen (iOS & Android compatible)

import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Switch,
  PermissionsAndroid,
  Platform,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import FusedLocation from 'react-native-fused-location';
import database from '@react-native-firebase/database';
import axios from 'axios';
import DropShadow from "react-native-drop-shadow";

import {
  normal, bold, regular, screenHeight, screenWidth,
  dashboard, api_url, change_online_status,
  LATITUDE_DELTA, LONGITUDE_DELTA,
  f_s, f_tiny, f_xs, get_heatmap_coordinates
} from '../config/Constants';
import * as colors from '../assets/css/Colors';
import Icon, { Icons } from '../components/Icons';
import { changeLocation } from '../actions/ChangeLocationActions';
import { initialLat, initialLng, initialRegion } from '../actions/BookingActions';
import strings from "../languages/strings";

const Dashboard = (props) => {
  const navigation = useNavigation();
  const map_ref = useRef();

  const [switch_value, setSwitchValue] = useState(global.live_status == 1);
  const [map_region, setMapRegion] = useState(null);
  const [wallet, setWallet] = useState(0);
  const [today_bookings, setTodayBookings] = useState(0);
  const [today_earnings, setTodayEarnings] = useState(0);
  const [vehicle_type, setVehicleType] = useState(0);
  const [sync_status, setSyncStatus] = useState(0);

  useEffect(() => {
    const init = async () => {
      if (Platform.OS === 'android') {
        await requestPermissions();
      } else {
        getInitialLocation();
      }
      callDashboard();
    };
    const unsubscribe = navigation.addListener("focus", init);
    return unsubscribe;
  }, []);

  const requestPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        await getInitialLocation();
      } else {
        Alert.alert(strings.permission_denied);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getInitialLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
        setMapRegion(region);
        props.initialLat(position.coords.latitude);
        props.initialLng(position.coords.longitude);
        props.initialRegion(region);
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const toggleSwitch = async (value) => {
    setSwitchValue(value);
    const status = value ? 1 : 0;
    await callChangeOnlineStatus(status);
  };

  const callDashboard = async () => {
    try {
      const response = await axios.post(api_url + dashboard, { id: global.id });
      const data = response.data.result;

      if (data.vehicle_type && !vehicle_type) {
        getLiveLocation(data.vehicle_type, data.sync_status);
        setVehicleType(data.vehicle_type);
      }

      setTodayBookings(data.today_bookings);
      setTodayEarnings(data.today_earnings);
      setWallet(data.wallet);
      setSyncStatus(data.sync_status);

    } catch (err) {
      console.log(err);
    }
  };

  const callChangeOnlineStatus = async (status) => {
    try {
      const response = await axios.post(api_url + change_online_status, {
        id: global.id,
        online_status: status,
      });

      if (response.data.status === 1) {
        global.live_status = status;
        await AsyncStorage.setItem('online_status', status.toString());
      } else {
        setSwitchValue(false);
        global.live_status = 0;
        await AsyncStorage.setItem('online_status', '0');
        if (response.data.status === 2) navigation.navigate('VehicleDetails');
        if (response.data.status === 3) navigation.navigate('VehicleDocument');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getLiveLocation = async (vt, sy) => {
    FusedLocation.setLocationPriority(FusedLocation.Constants.HIGH_ACCURACY);
    const location = await FusedLocation.getFusedLocation();
    if (location && sy === 1) {
      database().ref(`drivers/${vt}/${global.id}/geo`).update({
        lat: location.latitude,
        lng: location.longitude,
        bearing: location.bearing || 0,
      });
    }
    FusedLocation.startLocationUpdates();
    FusedLocation.on('fusedLocation', async location => {
      if (location && sy === 1) {
        props.changeLocation(location);
        database().ref(`drivers/${vt}/${global.id}/geo`).update({
          lat: location.latitude,
          lng: location.longitude,
          bearing: location.bearing || 0,
        });
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor={colors.theme_bg} barStyle="light-content" />
      <View style={styles.container}>
        <MapView
          ref={map_ref}
          style={styles.map}
          region={map_region}
          showsUserLocation={true}
          showsMyLocationButton={true}
        />
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.navigate('TripSettings')}>
            <Icon type={Icons.Ionicons} name="settings" style={styles.icon} />
          </TouchableOpacity>
          <Text style={[styles.statusText, { color: switch_value ? colors.success : colors.grey }]}>
            {switch_value ? strings.online : strings.offline}
          </Text>
          <Switch
            trackColor={{ false: colors.grey, true: colors.success }}
            thumbColor={switch_value ? colors.success : colors.grey}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={switch_value}
          />
        </View>

        <View style={styles.bottomCard}>
          <DropShadow style={styles.shadowBox}>
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Icon type={Icons.Ionicons} name="bookmark" style={styles.statIcon} />
                <Text style={styles.statValue}>{today_bookings}</Text>
                <Text style={styles.statLabel}>{strings.today_bookings}</Text>
              </View>
              <View style={styles.statBox}>
                <Icon type={Icons.FontAwesome} name="dollar" style={styles.statIcon} />
                <Text style={styles.statValue}>{global.currency}{today_earnings}</Text>
                <Text style={styles.statLabel}>{strings.today_earnings}</Text>
              </View>
            </View>
          </DropShadow>
        </View>

        {wallet === 0 && (
          <TouchableOpacity style={styles.walletWarning} onPress={() => navigation.navigate('Wallet')}>
            <Icon type={Icons.Ionicons} name="wallet" style={styles.walletIcon} />
            <Text style={styles.walletText}>{strings.your_wallet_balance_is_low_please_recharge_immediately}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: 'absolute',
    top: 20,
    left: '5%',
    right: '5%',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    backgroundColor: colors.theme_bg_three,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: 25,
    color: colors.theme_fg_two,
  },
  statusText: {
    fontFamily: bold,
    fontSize: f_s,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 80,
    left: '5%',
    right: '5%',
    backgroundColor: colors.theme_bg,
    padding: 15,
    borderRadius: 10,
  },
  shadowBox: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 30,
    color: colors.theme_fg_three,
  },
  statValue: {
    fontFamily: bold,
    fontSize: f_s,
    color: colors.theme_fg_three,
  },
  statLabel: {
    fontFamily: normal,
    fontSize: f_tiny,
    color: colors.theme_fg_three,
    marginTop: 4,
  },
  walletWarning: {
    position: 'absolute',
    top: 100,
    left: '5%',
    right: '5%',
    backgroundColor: colors.error_background,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIcon: {
    fontSize: 20,
    color: colors.error,
    marginRight: 10,
  },
  walletText: {
    fontSize: f_xs,
    fontFamily: regular,
    color: colors.error,
    flex: 1,
    flexWrap: 'wrap',
  },
});

const mapDispatchToProps = (dispatch) => ({
  changeLocation: (data) => dispatch(changeLocation(data)),
  initialLat: (data) => dispatch(initialLat(data)),
  initialLng: (data) => dispatch(initialLng(data)),
  initialRegion: (data) => dispatch(initialRegion(data)),
});

export default connect(null, mapDispatchToProps)(Dashboard);
