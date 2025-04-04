import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  FlatList,
  StatusBar,
  normal,
  I18nManager
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as colors from '../assets/css/Colors';
import Icon, { Icons } from '../components/Icons';
import { bold, regular, logo, menus, f_s, f_xs } from '../config/Constants';
import Dialog from "react-native-dialog";
import { connect } from 'react-redux';
import strings from "../languages/strings.js";
import { Picker } from '@react-native-picker/picker';
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-async-storage/async-storage';


const More = (props) => {
  const navigation = useNavigation();
  const [dialog_visible, setDialogVisible] = useState(false);

  const navigate = (route) => {
    if (route == 'Logout') {
      showDialog();
    } else {
      navigation.navigate(route);
    }
  }

  const showDialog = () => {
    setDialogVisible(true);
  }

  const closeDialog = () => {
    setDialogVisible(false);
  }

  const handleCancel = () => {
    setDialogVisible(false)
  }

  const handleLogout = async () => {
    closeDialog();
    navigation.navigate('Logout');
  }

  //More Menu
  const menus = [
    {
      menu_name: strings.kyc_verification,
      icon: 'files-o',
      route: 'KycVerification'
    },
    {
      menu_name: strings.training,
      icon: 'user',
      route: 'Training'
    },
    {
      menu_name: strings.frequently_asked_questions,
      icon: 'question-circle-o',
      route: 'Faq'
    },
    {
      menu_name: strings.earnings,
      icon: 'dollar',
      route: 'Earnings'
    },
    {
      menu_name: strings.withdrawal,
      icon: 'credit-card',
      route: 'Withdrawal'
    },
    {
      menu_name: strings.wallet,
      icon: 'money',
      route: 'Wallet'
    },
    {
      menu_name: strings.notifications,
      icon: 'bell',
      route: 'Notifications'
    },
    {
      menu_name: strings.about_us,
      icon: 'building-o',
      route: 'AboutUs'
    },
    {
      menu_name: strings.privacy_policies,
      icon: 'info-circle',
      route: 'PrivacyPolicies'
    },
    {
      menu_name: strings.logout,
      icon: 'sign-out',
      route: 'Logout'
    },
  ]

  const language_change = async (lang) => {
    if (global.lang != lang) {
      try {
        await AsyncStorage.setItem('lang', lang);
        strings.setLanguage(lang);
        if (lang == 'ar') {
          global.lang = await lang;
          await I18nManager.forceRTL(true);
          await RNRestart.Restart();
        } else {
          global.lang = await lang;
          await I18nManager.forceRTL(false);
          await RNRestart.Restart();
        }
      } catch (e) {

      }
    }
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.theme_bg_three, flex: 1 }}>
      <StatusBar
        backgroundColor={colors.theme_bg}
      />
      <Dialog.Container visible={dialog_visible}
        contentStyle={{ backgroundColor: colors.theme_bg_three }}
      >
        <Dialog.Title style={{ fontFamily: bold, color: colors.theme_fg_two, fontSize: f_s }}>{strings.confirm}</Dialog.Title>
        <Dialog.Description style={{ fontFamily: regular, color: colors.theme_fg_two, fontSize: f_s }}>
          {strings.do_you_want_to_logout}
        </Dialog.Description>
        <Dialog.Button style={{ fontFamily: regular, color: colors.theme_fg_two, fontSize: f_s }} label={strings.yes} onPress={handleLogout} />
        <Dialog.Button style={{ fontFamily: regular, color: colors.theme_fg_two, fontSize: f_s }} label={strings.no} onPress={handleCancel} />
      </Dialog.Container>
      <View style={{ margin: 15, alignItems: 'center' }}>
        <View style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderRadius: 55, padding: 2, width: 110, borderColor: colors.grey, borderStyle: 'dotted', alignSelf: 'center' }}>
          <View style={{ width: 100, height: 100 }} >
            <Image style={{ height: undefined, width: undefined, flex: 1, borderRadius: 75 }} source={logo} />
          </View>
        </View>
        <View style={{ margin: 5 }} />
        <Text style={{ color: colors.theme_fg_two, fontSize: f_s, fontFamily: bold }}>{global.first_name}</Text>
        <View style={{ margin: 2 }} />
        <Text style={{ color: colors.text_grey, fontSize: f_xs, fontFamily: regular }}>{global.email}</Text>
        <View style={{ margin: 5 }} />
        <TouchableOpacity onPress={() => navigate('Profile')} style={{ backgroundColor: colors.theme_bg, padding: 7, borderRadius: 10 }}>
          <Text style={{ color: colors.theme_fg_three, fontSize: f_xs, fontFamily: bold }}>{strings.edit_profile}</Text>
        </TouchableOpacity>
      </View>
      {/* <View style={{ backgroundColor: colors.lite_bg, padding: 10 }}>
          <Text style={{ color: colors.text_grey, fontSize: f_xs, fontFamily: regular }}>{strings.more}</Text>
        </View> */}
      <Picker
        selectedValue={global.lang}
        dropdownIconColor={colors.theme_bg}
        style={{ height: 20, width: 160, fontFamily: normal, color: colors.theme_bg, fontSize: 12 }}
        itemStyle={{ fontFamily: normal, color: colors.theme_bg, fontSize: 12 }}
        onValueChange={(itemValue, itemIndex) =>
          language_change(itemValue)
        }>
        <Picker.Item label={strings.english} style={{ fontSize: 12, color: colors.theme_fg, fontFamily: regular, backgroundColor: colors.theme_bg_three, }} value="en" />
        <Picker.Item label={strings.arabic} style={{ fontSize: 12, color: colors.theme_fg, fontFamily: regular, backgroundColor: colors.theme_bg_three, }} value="ar" />
      </Picker>
      <ScrollView>
        <FlatList
          data={menus}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => navigate(item.route)} style={{ flexDirection: 'row', width: '100%', padding: 15 }}>
              <View style={{ width: '80%', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row' }}>
                <View style={{ width: 50 }}>
                  {global.lang != 'ar' ?
                    <Icon type={Icons.FontAwesome} name={item.icon} color={colors.theme_fg_two} style={{ fontSize: 22 }} />
                    :
                    <Icon type={Icons.FontAwesome} name={item.icon} color={colors.theme_fg_two} style={{ fontSize: 22, paddingLeft: 20 }} />
                  }
                </View>
                <Text style={{ color: colors.theme_fg_two, fontSize: f_s, fontFamily: regular }}>{item.menu_name}</Text>
              </View>
              {global.lang != 'ar' ?
                <View style={{ width: '20%', alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
                  <Icon type={Icons.FontAwesome5} name="chevron-right" color={colors.text_grey} style={{ fontSize: 18 }} />
                </View>
                :
                <View style={{ width: '20%', alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
                  <Icon type={Icons.FontAwesome5} name="chevron-left" color={colors.text_grey} style={{ fontSize: 18 }} />
                </View>
              }
            </TouchableOpacity>
          )}
          keyExtractor={item => item.menu_name}
        />
        <View style={{ margin: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pickerFieldcontainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 5,
    height: 45,
    backgroundColor: colors.theme_bg_three,
  },
});

function mapStateToProps(state) {
  return {
    first_name: state.register.first_name,
    last_name: state.register.last_name,
    email: state.register.email,
  };
}

const mapDispatchToProps = (dispatch) => ({
  updateEmail: (data) => dispatch(updateEmail(data)),
  updateFirstName: (data) => dispatch(updateFirstName(data)),
  updateLastName: (data) => dispatch(updateLastName(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(More);