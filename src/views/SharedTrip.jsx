import React, { useState, useEffect, useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  FlatList,
  Linking,
  Platform
} from "react-native";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import * as colors from '../assets/css/Colors';
import { screenHeight, screenWidth, normal, bold, regular, get_ongoing_trip_details_shared, api_url, change_trip_status, GOOGLE_KEY, btn_loader, LATITUDE_DELTA, LONGITUDE_DELTA, trip_cancel, loader, f_xs, f_m, f_s, shared_trip_accept, shared_trip_reject, f_l } from '../config/Constants';
import BottomSheet from 'react-native-simple-bottom-sheet';
import Icon, { Icons } from '../components/Icons';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import LottieView from 'lottie-react-native';
import { Badge } from 'react-native-paper';
import axios from 'axios';
import Dialog from "react-native-dialog";
import { connect } from 'react-redux';
import DialogInput from 'react-native-dialog-input';
import DropdownAlert, {
  DropdownAlertData,
  DropdownAlertType,
} from 'react-native-dropdownalert';
import DropShadow from "react-native-drop-shadow";
import database from '@react-native-firebase/database';
import strings from "../languages/strings.js";

const SharedTrip = (props) => {
  const navigation = useNavigation();
  const route = useRoute();
  let alt = useRef(
    (_data?: DropdownAlertData) => new Promise < DropdownAlertData > (res => res),
  );
  const [trip_id, setTripId] = useState(route.params.trip_id);
  const [from, setFrom] = useState(route.params.from);
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  const [cancel_loading, setCancelLoading] = useState(false);
  const [on_load, setOnLoad] = useState(0);
  const [cancellation_reason, setCancellationReasons] = useState([]);
  const [dialog_visible, setDialogVisible] = useState(false);
  const [otp_dialog_visible, setOtpDialogVisible] = useState(false);
  const [pickup_statuses, setPickupStatuses] = useState([1, 2]);
  const [drop_statuses, setDropStatuses] = useState([3, 4]);
  const [cancellation_statuses, setCancellationStatuses] = useState([6, 7]);
  const map_ref = useRef();
  const [region, setRegion] = useState({
    latitude: props.initial_lat,
    longitude: props.initial_lng,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [trip_dialog_popup, setTripDialogPopup] = useState(false);
  const [new_customer_name, setNewCustomerName] = useState('');
  const [new_pickup_address, setNewPickupAddress] = useState('');
  const [new_booking_id, setNewBookingId] = useState(0);

  const go_back = () => {
    if (from == 'home') {
      navigation.navigate('Dashboard')
    } else {
      navigation.goBack();
    }
  }

  axios.interceptors.request.use(async function (config) {
    // Do something before request is sent
    console.log("loading")
    setLoading(true);
  //  setCancelLoading(true);
    return config;
  }, function (error) {
    console.log(error)
    setLoading(false);
 //   setCancelLoading(false);
    console.log("finish loading")
    // Do something with request error
    return Promise.reject(error);
  })

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      call_get_ongoing_trip_details_shared();
    });

    const onValueChange = database().ref(`shared/${global.id}`)
      .on('value', snapshot => {
        if (snapshot.val().booking_id) {
          setTripDialogPopup(true);
          setNewCustomerName(snapshot.val().customer_name);
          setNewPickupAddress(snapshot.val().pickup_address);
          setNewBookingId(snapshot.val().booking_id);
        }
      });
    return (
      unsubscribe,
      onValueChange
    );
  }, []);

  const call_get_ongoing_trip_details_shared = async () => {
    if (props.change_location.latitude && props.change_location.longitude) {

      await axios({
        method: 'post',
        url: api_url + get_ongoing_trip_details_shared,
        data: { driver_id: global.id, lat: props.change_location.latitude != undefined ? props.change_location.latitude : props.initial_lat, lng: props.change_location.longitude != undefined ? props.change_location.longitude : props.initial_lng }
      })
        .then(async response => {
          setLoading(false);
          if (response.data.result.trip.status == 4) {
            navigation.navigate('Bill', { trip_id: trip_id, from: 'shared_trip' });
          } else if (cancellation_statuses.includes(parseInt(response.data.result.trip.status)) && from == 'home') {
            navigate_home();
          }
          setData(response.data.result);
          setTripId(response.data.result.trip.id);
          setCancellationReasons(response.data.result.cancellation_reasons);
          setOnLoad(1);
        })
        .catch(error => {
          setLoading(false);
        });
    } else {
      go_back();
    }

  }

  const check_otp = () => {
    if (data.trip.new_status.id == 3) {
      setOtpDialogVisible(true);
    } else {
      onRegionChange();
    }
  }

  const onRegionChange = async () => {
    fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + props.change_location.latitude + ',' + props.change_location.longitude + '&key=' + GOOGLE_KEY)
      .then((response) => response.json())
      .then(async (responseJson) => {
        if (responseJson.results[2].formatted_address != undefined) {
          setRegion({
            latitude: props.change_location.latitude,
            longitude: props.change_location.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          })
          call_change_trip_status(responseJson.results[2].formatted_address);
        }
      })
  }

  const call_change_trip_status = async (address) => {

    await axios({
      method: 'post',
      url: api_url + change_trip_status,
      data: { trip_id: trip_id, status: data.trip.new_status.id, address: address, lat: props.change_location.latitude, lng: props.change_location.longitude }
    })
      .then(async response => {
        call_get_ongoing_trip_details_shared();
      })
      .catch(error => {
        setLoading(false);
      });
  }

  const showDialog = () => {
    setDialogVisible(true);
  }

  const call_trip_cancel = async (reason_id, type) => {
    setDialogVisible(false)
    setCancelLoading(true)
    console.log( { trip_id: trip_id, status: 7, reason_id: reason_id, cancelled_by: type })
    await axios({
      method: 'post',
      url: api_url + trip_cancel,
      data: { trip_id: trip_id, status: 7, reason_id: reason_id, cancelled_by: type }
    })
      .then(async response => {
        setCancelLoading(false)
        console.log('success')
        call_get_ongoing_trip_details_shared();
      })
      .catch(error => {
        //alert(error)
        setCancelLoading(false);
      });
  }

  const navigate_home = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  }

  const call_dialog_visible = () => {
    setDialogVisible(false)
  }

  const verify_otp = async (val) => {
    if (val == data.trip.otp) {
      setOtpDialogVisible(false);
      await onRegionChange();
    } else {
      alt({
        type: DropdownAlertType.Error,
        title: strings.validation_error,
        message: strings.enter_valid_otp,
      });

      closeOtpDialog();
    }
  }

  const closeOtpDialog = () => {
    setOtpDialogVisible(false)
  }



  const redirection = () => {
    if (pickup_statuses.includes(parseInt(data.trip.status))) {
      var lat = data.trip.pickup_lat;
      var lng = data.trip.pickup_lng;
    } else {
      var lat = data.trip.drop_lat;
      var lng = data.trip.drop_lng;
    }

    if (lat != 0 && lng != 0) {
      var scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
      var url = scheme + `${lat},${lng}`;
      if (Platform.OS === 'android') {
        Linking.openURL("google.navigation:q=" + lat + " , " + lng + "&mode=d");
      } else {
        Linking.openURL('https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng + '&travelmode=driving');
      }
    }
  }

  const call_customer = (phone_number) => {
    Linking.openURL(`tel:${phone_number}`)
  }

  const call_chat = (data) => {
    navigation.navigate("Chat", { data: data, trip_id: trip_id })
  }

  call_trip_accept = async () => {
    
    await axios({
      method: 'post',
      url: api_url + shared_trip_accept,
      data: { trip_id: new_booking_id, driver_id: global.id }
    })
      .then(async response => {
        setLoading(false)
        if (response.data.status == 1) {
          setTripDialogPopup(false);
          setNewBookingId(0);
          setNewCustomerName('');
          setNewPickupAddress('');
          call_get_ongoing_trip_details_shared();
        } else {
          alt({
            type: DropdownAlertType.Error,
            title: strings.trip_cancelled,
            message: strings.sorry_customer_cancelled,
          });
          await go_back();
        }
      })
      .catch(error => {
        console.log(error)
        setLoading(false)
        alt({
          type: DropdownAlertType.Error,
          title: strings.validation_error,
          message: strings.sorry_something_went_wrong,
        });

      });
  }

  call_trip_reject = async () => {

    await axios({
      method: 'post',
      url: api_url + shared_trip_reject,
      data: { trip_id: new_booking_id, driver_id: global.id, from: 2 }
    })
      .then(async response => {
        setLoading(false)
        if (response.data.status == 1) {
          setTripDialogPopup(false);
          setNewBookingId(0);
          setNewCustomerName('');
          setNewPickupAddress('');
          call_get_ongoing_trip_details_shared();
        }
      })
      .catch(error => {
        setLoading(false)
        alt({
          type: DropdownAlertType.Error,
          title: strings.validation_error,
          message: strings.sorry_something_went_wrong,
        });

      });
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={colors.theme_bg}
      />
      <MapView
        provider={PROVIDER_GOOGLE}
        ref={map_ref}
        style={styles.map}
        region={region}
      >
      </MapView>
      {on_load == 1 &&
        <View>
          {from == 'trips' &&
            <View style={{ flexDirection: 'row' }}>
              <DropShadow
                style={{
                  width: '50%',
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 25,
                }}
              >
                <TouchableOpacity activeOpacity={0} onPress={go_back.bind(this)} style={{ width: 40, height: 40, backgroundColor: colors.theme_bg_three, borderRadius: 25, alignItems: 'center', justifyContent: 'center', top: 20, left: 20 }}>
                  <Icon type={Icons.MaterialIcons} name="arrow-back" color={colors.icon_active_color} style={{ fontSize: 22 }} />
                </TouchableOpacity>
              </DropShadow>
            </View>
          }
        </View>
      }
      <BottomSheet sliderMinHeight={190} sliderMaxHeight={screenHeight - 200} isOpen>
        {(onScrollEndDrag) => (
          <ScrollView onScrollEndDrag={onScrollEndDrag}>
            <View style={{ padding: 10 }}>
              {on_load == 1 ?
                <View>
                  <View style={{ borderBottomWidth: 0.5, borderColor: colors.grey }}>
                    <View style={{ width: '100%', marginBottom: 10 }}>
                      <View style={{ marginBottom: 10 }}>
                        <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: f_l, fontFamily: bold }}>{data.trip.customer_name} - #{data.trip.customer_id}</Text>
                      </View>
                      {pickup_statuses.includes(parseInt(data.trip.status)) &&
                        <TouchableOpacity onPress={redirection.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.theme_bg_three }}>
                          <View style={{ flexDirection: 'row', width: '100%', height: 50 }}>
                            <View style={{ width: '10%', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 }}>
                              <Badge status="success" backgroundColor="green" size={10}/>    
                            </View>
                            <View style={{ margin: 3}}/>
                            <View style={{ width: '80%', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                              <Text numberOfLines={1} style={{ color: colors.grey, fontSize: f_xs, fontFamily: regular }}>{strings.pickup_address}</Text>
                              <View style={{ margin: 2 }} />
                              <Text numberOfLines={2} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: f_xs, fontFamily: regular }}>{data.trip.pickup_address}</Text>
                            </View>
                            <View style={{ width: '10%', alignItems: 'flex-end', justifyContent: 'center', paddingTop: 4 }}>
                              <Icon type={Icons.MaterialCommunityIcons} name="navigation-variant" color={colors.theme_fg_two} style={{ fontSize: 25 }} />
                            </View>
                          </View>
                        </TouchableOpacity>
                      }
                      {drop_statuses.includes(parseInt(data.trip.status)) && data.trip.trip_type != 2 &&
                        <TouchableOpacity onPress={redirection.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.theme_bg_three }}>
                          <View style={{ flexDirection: 'row', width: '100%', height: 50 }}>
                            <View style={{ width: '10%', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 }}>
                              <Badge status="error" backgroundColor="red" size={10}/>
                            </View>
                            <View style={{ margin: 3}}/>
                            <View style={{ width: '80%', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                              <Text numberOfLines={1} style={{ color: colors.grey, fontSize: f_xs, fontFamily: regular }}>{strings.drop_address}</Text>
                              <View style={{ margin: 2 }} />
                              <Text numberOfLines={2} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: f_xs, fontFamily: regular }}>{data.trip.drop_address}</Text>
                            </View>
                            <View style={{ width: '10%', alignItems: 'flex-end', justifyContent: 'center', paddingTop: 4 }}>
                              <Icon type={Icons.MaterialCommunityIcons} name="navigation-variant" color={colors.theme_fg_two} style={{ fontSize: 25 }} />
                            </View>
                          </View>
                        </TouchableOpacity>
                      }
                      {drop_statuses.includes(parseInt(data.trip.status)) && data.trip.trip_type == 2 &&
                        <TouchableOpacity activeOpacity={1} style={{ width: '100%', backgroundColor: colors.theme_bg_three }}>
                          <View style={{ flexDirection: 'row', marginBottom: 20, marginLeft: 10, marginRight: 10 }}>
                            <View style={{ width: '10%' }}>
                              <Icon type={Icons.MaterialIcons} name="schedule" color={colors.icon_inactive_color} style={{ fontSize: 22 }} />
                            </View>
                            <View style={{ width: '90%' }}>
                              <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: f_m, fontFamily: bold }}>{data.trip.package_details.hours} {strings.hrs} {data.trip.package_details.kilometers} {strings.km_package}</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      }
                    </View>
                  </View>
                  {data.trip.status <= 2 &&
                    <View style={{ borderBottomWidth: 0.5, borderTopWidth: 0.5, borderColor: colors.grey }}>
                      <View style={{ flexDirection: 'row', width: '100%', marginTop: 10, marginBottom: 10 }}>
                        <TouchableOpacity onPress={call_chat.bind(this, data.customer)} style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon type={Icons.MaterialIcons} name="chat" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
                        </TouchableOpacity>
                        <View style={{ width: '5%' }} />
                        <TouchableOpacity onPress={call_customer.bind(this, data.trip.customer.phone_number)} style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon type={Icons.MaterialIcons} name="call" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
                        </TouchableOpacity>
                        <View style={{ width: '10%' }} />
                        {cancel_loading == false ?
                          <TouchableOpacity onPress={showDialog.bind(this)} activeOpacity={1} style={{
                            width: '55%', backgroundColor:
                              colors.error_background, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Text style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.error, fontFamily: bold }}>
                            {strings.cancel}
                            </Text>
                          </TouchableOpacity>
                          :
                          <View style={{ height: 50, width: '90%', alignSelf: 'center' }}>
                            <LottieView style={{ flex: 1 }} source={loader} autoPlay loop />
                          </View>
                        }
                      </View>
                    </View>
                  }
                  <View style={{ borderColor: colors.grey }}>
                    <View style={{ flexDirection: 'row', width: '100%', marginTop: 10, marginBottom: 20 }}>
                      <View style={{ width: '33%', alignItems: 'center', justifyContent: 'center' }}>
                        <Text numberOfLines={1} style={{ color: colors.grey, fontSize: f_xs, fontFamily: regular }}>{strings.distance}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                          <Icon type={Icons.MaterialIcons} name="map" color={colors.theme_fg_two} style={{ fontSize: 22 }} />
                          <View style={{ margin: 2 }} />
                          <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: f_xs, fontFamily: normal }}>{data.trip.distance} {strings.km}</Text>
                        </View>
                      </View>
                      <View style={{ width: '33%', alignItems: 'center', justifyContent: 'center' }}>
                        <Text numberOfLines={1} style={{ color: colors.grey, fontSize: f_xs, fontFamily: regular }}>{strings.trip_type}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                          <Icon type={Icons.MaterialIcons} name="commute" color={colors.theme_fg_two} style={{ fontSize: 22 }} />
                          <View style={{ margin: 2 }} />
                          <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: f_xs, fontFamily: normal }}>{data.trip.trip_type_name}</Text>
                        </View>
                      </View>
                      <View style={{ width: '33%', alignItems: 'center', justifyContent: 'center' }}>
                        <Text numberOfLines={1} style={{ color: colors.grey, fontSize: f_xs, fontFamily: regular }}>{strings.estimated_fare}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                          <Icon type={Icons.MaterialIcons} name="local-atm" color={colors.theme_fg_two} style={{ fontSize: 22 }} />
                          <View style={{ margin: 2 }} />
                          <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: f_xs, fontFamily: normal }}>{global.currency}{data.trip.total}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <DialogInput
                    isDialogVisible={otp_dialog_visible}
                    title={strings.enter_your_otp}
                    message={strings.collect_your_otp_from_your_customer}
                    textInputProps={{ keyboardType: "phone-pad" }}
                    submitInput={(inputText) => { verify_otp(inputText) }}
                    closeDialog={() => { closeOtpDialog(false) }}
                    submitText={strings.submit}
                    cancelText={strings.cancel}
                    modelStyle={{ fontFamily: regular, fontSize: 14, textColor: colors.theme_fg }}>
                  </DialogInput>
                  {data.trip.status < 5 &&
                    <View>
                      {loading == false ?
                        <View>
                          {global.lang == 'en' ?
                            <TouchableOpacity onPress={check_otp.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.theme_fg_three, fontFamily: bold }}>{data.trip.new_status.status_name}</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={check_otp.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.theme_fg_three, fontFamily: bold }}>{data.trip.new_status.status_name_ar}</Text>
                            </TouchableOpacity>
                          }
                        </View>
                        :
                        <View style={{ height: 50, width: '90%', alignSelf: 'center' }}>
                          <LottieView style={{ flex: 1 }} source={btn_loader} autoPlay loop />
                        </View>
                      }
                    </View>
                  }
                  <Dialog.Container
                    visible={dialog_visible}
                    contentStyle={{backgroundColor: colors.theme_bg_three}}
                  >
                    <Dialog.Title><Text style={{ color: colors.theme_fg_two }}>{strings.reason_to_cancel_your_ride}</Text></Dialog.Title>
                    <Dialog.Description>
                      <FlatList
                        data={cancellation_reason}
                        renderItem={({ item, index }) => (
                          <TouchableOpacity onPress={call_trip_cancel.bind(this, item.id, item.type)} activeOpacity={1} >
                            {global.lang == 'en' ?
                              <View style={{ padding: 10 }}>
                                <Text style={{ fontFamily: regular, fontSize: f_xs, color: colors.theme_fg_two }}>{item.reason}</Text>
                              </View>
                              :
                              <View style={{ padding: 10 }}>
                                <Text style={{ fontFamily: regular, fontSize: f_xs, color: colors.theme_fg_two }}>{item.reason_ar}</Text>
                              </View>
                            }
                          </TouchableOpacity>
                        )}
                        keyExtractor={item => item.id}
                      />
                    </Dialog.Description>
                    <Dialog.Button label={strings.cancel} color={colors.theme_bg}  onPress={handleCancel} />
                  </Dialog.Container>
                  {/*accept shared trip popup*/}
                  <Dialog.Container
                    visible={trip_dialog_popup}
                  >
                    <Dialog.Title>{strings.your_new_booking}</Dialog.Title>
                    <Dialog.Description>
                      <View>
                        <View style={{ padding: 10 }}>
                          <Text style={{ fontFamily: regular, fontSize: 18, color: colors.theme_fg_two }}>{new_customer_name}</Text>
                        </View>
                        <View style={{ padding: 10 }}>
                          <Text style={{ fontFamily: regular, fontSize: 14, color: colors.theme_fg_two }}>{new_pickup_address}</Text>
                        </View>
                      </View>
                      </Dialog.Description>
                    <Dialog.Button footerStyle={{ fontSize: f_m, color: colors.theme_fg_two, fontFamily: regular }} label={strings.accept} onPress={call_trip_accept} />
                    <Dialog.Button footerStyle={{ fontSize: f_m, color: colors.theme_fg_two, fontFamily: regular }} label={strings.reject} onPress={call_trip_reject} />
                    </Dialog.Container>
                </View>
                :
                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <Text style={{ color: colors.theme_fg_two, fontSize: f_s, fontFamily: regular }}>{strings.loading}</Text>
                </View>
              }
            </View>
          </ScrollView>
        )}
      </BottomSheet>
      <DropdownAlert alert={func => (alt = func)} />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: screenHeight,
    width: screenWidth,
    backgroundColor: colors.lite_bg
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

function mapStateToProps(state) {
  return {
    change_location: state.change_location.change_location,
    initial_lat: state.booking.initial_lat,
    initial_lng: state.booking.initial_lng,
    initial_region: state.booking.initial_region,
  };
}

export default connect(mapStateToProps, null)(SharedTrip);