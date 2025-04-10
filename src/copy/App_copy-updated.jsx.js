import React, { useEffect, useRef } from 'react';
import { createStackNavigator,TransitionPresets } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon, { Icons } from '../components/Icons.js';
import * as colors from '../assets/css/Colors.js';
import * as Animatable from 'react-native-animatable';
import strings from "../languages/strings.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

/* Screens */
import Bookings from '../views/Bookings.jsx';
import BookingRequest from '../views/BookingRequest.jsx';
import Chat from '../views/Chat.jsx';
import DirectBooking from '../views/DirectBooking.jsx';
import VehicleDocument from '../views/VehicleDocument.jsx';
import DocumentUpload from '../views/DocumentUpload.jsx';
import DriverRegisteration from '../views/DriverRegisteration.jsx';
import Dashboard from '../views/Dashboard.jsx';
import Earnings from '../views/Earnings.jsx';
import EditEmail from '../views/EditEmail.jsx';
import EditFirstName from '../views/EditFirstName.jsx';
import EditLastName from '../views/EditLastName.jsx';
import EditPassword from '../views/EditPassword.jsx';
import EditPhoneNumber from '../views/EditPhoneNumber.jsx';
import Faq from '../views/Faq.jsx';
import FaqDetails from '../views/FaqDetails.jsx';
import Forgot from '../views/Forgot.jsx';
import KycVerification from '../views/KycVerification.jsx';
import Login from '../views/Login.jsx';
import LoginHome from '../views/LoginHome.jsx';
import Logout from '../views/Logout.jsx';
import More from '../views/More.jsx';
import MyRentalRides from '../views/MyRentalRides.jsx';
import Notifications from '../views/Notifications.jsx';
import NotificationDetails from '../views/NotificationDetails.jsx';
import Profile from '../views/Profile.jsx';
import Rating from '../views/Rating.jsx';
import RentalRideDetails from '../views/RentalRideDetails.jsx';
import RideDetails from '../views/RideDetails.jsx';
import SharedTrip from '../views/SharedTrip.jsx';
import Splash from '../views/Splash.jsx';
import Training from '../views/Training.jsx';
import TrainingDetails from '../views/TrainingDetails.jsx';
import Trip from '../views/Trip.jsx';
import TripSettings from '../views/TripSettings.jsx';
import VehicleDetails from '../views/VehicleDetails.jsx';
import Wallet from '../views/Wallet.jsx';
import Withdrawal from '../views/Withdrawal.jsx';
import CheckPhone from '../views/CheckPhone.jsx';
import Password from '../views/Password.jsx';
import OTP from '../views/OTP.jsx';
import CreateName from '../views/CreateName.jsx';
import CreateEmail from '../views/CreateEmail.jsx';
import CreatePassword from '../views/CreatePassword.jsx';
import CreateLicenceNumber from '../views/CreateLicenceNumber.jsx';
import CreateDateOfBirth from '../views/CreateDateOfBirth.jsx';
import ResetPassword from '../views/ResetPassword.jsx';
import CreateVehicleName from '../views/CreateVehicleName.jsx';
import CreateVehicleBrand from '../views/CreateVehicleBrand.jsx';
import CreateVehicleColor from '../views/CreateVehicleColor.jsx';
import CreateVehicleNumber from '../views/CreateVehicleNumber.jsx';
import CreateVehicleType from '../views/CreateVehicleType.jsx';
import AboutUs from '../views/AboutUs.jsx';
import Bill from '../views/Bill.jsx';
import EditAccountNumber from '../views/EditAccountNumber.jsx'; 
import EditBankName from '../views/EditBankName.jsx'; 
import EditIfscCode from '../views/EditIfscCode.jsx'; 
import EditAadharNumber from '../views/EditAadharNumber.jsx'; 
import EditPanNumber from '../views/EditPanNumber.jsx';
import LocationEnable from '../views/LocationEnable.jsx';
import Paypal from '../views/Paypal.jsx';
import AppUpdate from '../views/AppUpdate.jsx'; 
import PrivacyPolicies from '../views/PrivacyPolicies.jsx';
import RNRestart from 'react-native-restart';

const TabArr = [
  { route: 'Dashboard', label:"Home", ar_label:"بيت", type: Icons.FontAwesome, icon: 'car', component: Dashboard, color: colors.theme_fg, alphaClr: colors.theme_bg_three },
  { route: 'Bookings', label:"Bookings", ar_label:"الحجوزات", type: Icons.FontAwesome, icon: 'book', component: Bookings, color: colors.theme_fg, alphaClr: colors.theme_bg_three },
  //{ route: 'MyRentalRides', label:'Hire Trips', type: Icons.MaterialIcons, icon: 'car-rental', component: MyRentalRides, color: colors.theme_fg, alphaClr: colors.theme_bg_three },
  { route: 'More', label:"More", ar_label:"أكثر", type: Icons.Ionicons, icon: 'settings', component: More, color: colors.theme_fg, alphaClr: colors.theme_bg_three },
];

const Tab = createBottomTabNavigator();

const language_change = async (lang) => {
  if (global.lang != lang) {
    try {
      await AsyncStorage.setItem('lang', lang);
      await strings.setLanguage(lang);
      global.lang = await lang;
      if (lang == 'sp') {
        global.lang = await lang;
        await RNRestart.Restart();
      } else {
        global.lang = await lang;
        await RNRestart.Restart();
      }
    } catch (e) {

    }
  }
}

const TabButton = (props) => {
  const { item, onPress, accessibilityState } = props;
  const focused = accessibilityState.selected;
  const viewRef = useRef(null);
  const textViewRef = useRef(null);

  useEffect(() => {
    if (focused) { // 0.3: { scale: .7 }, 0.5: { scale: .3 }, 0.8: { scale: .7 },
      viewRef.current.animate({ 0: { scale: 0 }, 1: { scale: 1 } });
      textViewRef.current.animate({0: {scale: 0}, 1: {scale: 1}});
    } else {
      viewRef.current.animate({ 0: { scale: 1, }, 1: { scale: 0, } });
      textViewRef.current.animate({0: {scale: 1}, 1: {scale: 0}});
    }
  }, [focused])

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={[styles.container, {flex: focused ? 1 : 0.60}]}>
      <View>
        <Animatable.View
          ref={viewRef}
          style={[StyleSheet.absoluteFillObject, { backgroundColor: item.color, borderRadius: 16 }]} />
        <View style={[styles.btn, { backgroundColor: focused ? null : item.alphaClr }]}>
          <Icon type={item.type} name={item.icon} color={focused ? colors.theme_fg_three : colors.grey} />
       
          {global.lang == 'ar' ?
            < Animatable.View
              ref={textViewRef}>
              {focused && <Text style={{
                color: colors.theme_fg_three, paddingHorizontal: 8
              }}>{item.ar_label}</Text>}
            </Animatable.View>
            :
            <Animatable.View
              ref={textViewRef}>
              {focused && <Text style={{
                color: colors.theme_fg_three, paddingHorizontal: 8
              }}>{item.label}</Text>}
            </Animatable.View>
          }
        </View>
      </View>
    </TouchableOpacity>
  )
}

function TabNavigator() {
  return (
    <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        height: 60,
        position: 'absolute',
       
        right: 16,
        left: 16,
        borderRadius: 16,
       
        bottom: Platform.OS === 'ios' ? 30 : 16, // push up for iOS // <-- added this line
      },
    }}
  >
    {TabArr.map((item, index) => {
      return (
        <Tab.Screen
          key={index}
          name={item.route}
          component={item.component}
          options={{
            tabBarShowLabel: false,
            tabBarButton: (props) => <TabButton {...props} item={item} />,
          }}
        />
      );
    })}
  </Tab.Navigator>
  
  )
}

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={({ route, navigation }) => ({
                        ...TransitionPresets.SlideFromRightIOS,
                    })} options={{headerShown: false}}  >
        <Stack.Screen name="Splash" component={Splash} options={{headerShown: false}}  />
        <Stack.Screen name="Bookings" component={Bookings} options={{headerShown: false}}  />
        <Stack.Screen name="BookingRequest" component={BookingRequest} options={{headerShown: false}}  />
        <Stack.Screen name="Chat" component={Chat} options={{headerShown: false}}  />
        <Stack.Screen name="DirectBooking" component={DirectBooking} options={{headerShown: false}}  />
        <Stack.Screen name="VehicleDocument" component={VehicleDocument} options={{headerShown: false}}  />
        <Stack.Screen name="DocumentUpload" component={DocumentUpload} options={{headerShown: false}}  />
        <Stack.Screen name="DriverRegisteration" component={DriverRegisteration} options={{headerShown: false}}  />
        <Stack.Screen name="Home" component={TabNavigator} options={{headerShown: false}}  />
        <Stack.Screen name="EditEmail" component={EditEmail} options={{headerShown: false}}  />
        <Stack.Screen name="EditFirstName" component={EditFirstName} options={{headerShown: false}}  />
        <Stack.Screen name="EditLastName" component={EditLastName} options={{headerShown: false}}  />
        <Stack.Screen name="EditPassword" component={EditPassword} options={{headerShown: false}}  />
        <Stack.Screen name="EditPhoneNumber" component={EditPhoneNumber} options={{headerShown: false}}  />
        <Stack.Screen name="Faq" component={Faq} options={{headerShown: false}}  />
        <Stack.Screen name="FaqDetails" component={FaqDetails} options={{headerShown: false}}  />
        <Stack.Screen name="Forgot" component={Forgot} options={{headerShown: false}}  />
        <Stack.Screen name="KycVerification" component={KycVerification} options={{headerShown: false}}  />
        <Stack.Screen name="Login" component={Login} options={{headerShown: false}}  />
        <Stack.Screen name="LoginHome" component={LoginHome} options={{headerShown: false}}  />
        <Stack.Screen name="Logout" component={Logout} options={{headerShown: false}}  />
        <Stack.Screen name="More" component={More} options={{headerShown: false}}  />
        <Stack.Screen name="MyRentalRides" component={MyRentalRides} options={{headerShown: false}}  />
        <Stack.Screen name="Notifications" component={Notifications} options={{headerShown: false}}  />
        <Stack.Screen name="NotificationDetails" component={NotificationDetails} options={{headerShown: false}}  />
        <Stack.Screen name="Profile" component={Profile} options={{headerShown: false}}  />
        <Stack.Screen name="Rating" component={Rating} options={{headerShown: false}}  />
        <Stack.Screen name="RentalRideDetails" component={RentalRideDetails} options={{headerShown: false}}  />
        <Stack.Screen name="RideDetails" component={RideDetails} options={{headerShown: false}}  />
        <Stack.Screen name="SharedTrip" component={SharedTrip} options={{headerShown: false}}  />
        <Stack.Screen name="Training" component={Training} options={{headerShown: false}}  />
        <Stack.Screen name="TrainingDetails" component={TrainingDetails} options={{headerShown: false}}  />
        <Stack.Screen name="Trip" component={Trip} options={{headerShown: false}}  />
        <Stack.Screen name="TripSettings" component={TripSettings} options={{headerShown: false}}  />
        <Stack.Screen name="VehicleDetails" component={VehicleDetails} options={{headerShown: false}}  />
        <Stack.Screen name="Wallet" component={Wallet} options={{headerShown: false}}  />
        <Stack.Screen name="Withdrawal" component={Withdrawal} options={{headerShown: false}} />
        <Stack.Screen name="CheckPhone" component={CheckPhone} options={{headerShown: false}} />
        <Stack.Screen name="Password" component={Password} options={{headerShown: false}} />
        <Stack.Screen name="OTP" component={OTP} options={{headerShown: false}} />
        <Stack.Screen name="CreateName" component={CreateName} options={{headerShown: false}} />
        <Stack.Screen name="CreateEmail" component={CreateEmail} options={{headerShown: false}} />
        <Stack.Screen name="CreateLicenceNumber" component={CreateLicenceNumber} options={{headerShown: false}} />
        <Stack.Screen name="CreateDateOfBirth" component={CreateDateOfBirth} options={{headerShown: false}} />
        <Stack.Screen name="CreatePassword" component={CreatePassword} options={{headerShown: false}} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} options={{headerShown: false}} />
        <Stack.Screen name="CreateVehicleName" component={CreateVehicleName} options={{headerShown: false}} />
        <Stack.Screen name="CreateVehicleBrand" component={CreateVehicleBrand} options={{headerShown: false}} />
        <Stack.Screen name="CreateVehicleColor" component={CreateVehicleColor} options={{headerShown: false}} />
        <Stack.Screen name="CreateVehicleNumber" component={CreateVehicleNumber} options={{headerShown: false}} />
        <Stack.Screen name="CreateVehicleType" component={CreateVehicleType} options={{headerShown: false}} />
        <Stack.Screen name="AboutUs" component={AboutUs} options={{headerShown: false}} />
        <Stack.Screen name="Bill" component={Bill} options={{headerShown: false}} />
        <Stack.Screen name="EditAccountNumber" component={EditAccountNumber} options={{headerShown: false}} />
        <Stack.Screen name="EditBankName" component={EditBankName} options={{headerShown: false}} />
        <Stack.Screen name="EditIfscCode" component={EditIfscCode} options={{headerShown: false}} />
        <Stack.Screen name="EditAadharNumber" component={EditAadharNumber} options={{headerShown: false}} />
        <Stack.Screen name="EditPanNumber" component={EditPanNumber} options={{headerShown: false}} />
        <Stack.Screen name="Earnings" component={Earnings} options={{headerShown: false}} /> 
        <Stack.Screen name="LocationEnable" component={LocationEnable} options={{headerShown: false}} />
        <Stack.Screen name="Paypal" component={Paypal} options={{headerShown: false}} /> 
        <Stack.Screen name="AppUpdate" component={AppUpdate} options={{headerShown: false}} /> 
        <Stack.Screen name="PrivacyPolicies" component={PrivacyPolicies} options={{headerShown: false}} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: Platform.OS === 'ios' ? -30 : 0,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
  },
});

export default App;