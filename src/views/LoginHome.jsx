import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { connect } from 'react-redux';
const LoginHome = (props) => {
  const navigation = useNavigation();

  useEffect(() => {
    
  }, []);

  return (
    <View>
      <Text style={{ color:'#000'}}>hi</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logo_container: {
    flex:1
  }
});

export default connect(null,null)(LoginHome);