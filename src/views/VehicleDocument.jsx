import React, { useEffect, useRef, useState, memo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { connect } from 'react-redux';
import DropdownAlert from 'react-native-dropdownalert';
import axios from 'axios';

import * as colors from '../assets/css/Colors';
import Icon, { Icons } from '../components/Icons';
import {
  normal,
  bold,
  img_url,
  api_url,
  get_documents,
  upload_icon,
  id_proof_icon,
  vehicle_certificate_icon,
  vehicle_insurance_icon,
  vehicle_image_icon,
  f_xl,
  f_l,
  f_xs,
  f_s,
  f_m,
} from '../config/Constants';
import strings from '../languages/strings';

const VehicleDocument = () => {
  const navigation = useNavigation();
  const dropdownAlertRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [idProof, setIdProof] = useState({
    path: id_proof_icon,
    status: 0,
    status_name: strings.waiting_for_upload,
    color: colors.warning,
  });
  const [vehicleCertificate, setVehicleCertificate] = useState({
    path: vehicle_certificate_icon,
    status: 0,
    status_name: strings.waiting_for_upload,
    color: colors.warning,
  });
  const [vehicleInsurance, setVehicleInsurance] = useState({
    path: vehicle_insurance_icon,
    status: 0,
    status_name: strings.waiting_for_upload,
    color: colors.warning,
  });
  const [vehicleImage, setVehicleImage] = useState({
    path: vehicle_image_icon,
    status: 0,
    status_name: strings.waiting_for_upload,
    color: colors.warning,
  });
  const [vehicleId, setVehicleId] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(0);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      callGetDocuments();
    });
    return () => unsubscribe();
  }, [navigation]);

  // Axios interceptor for loading state
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        setLoading(true);
        return config;
      },
      (error) => {
        setLoading(false);
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        setLoading(false);
        return response;
      },
      (error) => {
        setLoading(false );
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const showAlert = (type, title, message) => {
    dropdownAlertRef.current?.alertWithType(type, title, message);
  };

  const findDocument = (list) => {
    list.forEach((data) => {
      const value = {
        path: { uri: img_url + data.path },
        status: data.status,
        status_name: data.status_name,
        color: getStatusForeground(data.status),
      };
      switch (data.document_name) {
        case 'id_proof':
          setIdProof(value);
          break;
        case 'vehicle_certificate':
          setVehicleCertificate(value);
          break;
        case 'vehicle_image':
          setVehicleImage(value);
          break;
        case 'vehicle_insurance':
          setVehicleInsurance(value);
          break;
      }
    });
  };

  const getStatusForeground = (status) => {
    switch (status) {
      case 17:
        return colors.error;
      case 14:
      case 15:
        return colors.warning;
      case 16:
        return colors.success;
      default:
        return colors.warning;
    }
  };

  const moveToUpload = (slug, status, path) => {
    const table = slug === 'id_proof' ? 'drivers' : 'driver_vehicles';
    const find_field = slug === 'id_proof' ? 'id' : 'id';
    const find_value = slug === 'id_proof' ? global.id : vehicleId;
    const status_field = slug === 'id_proof' ? 'id_proof_status' : `${slug}_status`;

    navigation.navigate('DocumentUpload', {
      slug,
      path: status === 14 ? upload_icon : path,
      status,
      table,
      find_field,
      find_value,
      status_field,
    });
  };

  const goBack = () => {
    navigation.navigate('Home');
  };

  const callGetDocuments = async () => {
    try {
      const response = await axios.post(api_url + get_documents, {
        driver_id: global.id,
        lang: global.lang,
      });

      setVehicleId(response.data.result.details.vehicle_id);
      if (response.data.result.documents.every((doc) => doc.status === 15)) {
        setUploadStatus(1);
      } else {
        findDocument(response.data.result.documents);
      }
    } catch (error) {
      console.error('Get documents error:', error);
      showAlert(
        DropdownAlert.DropdownAlertType.Error,
        strings.error,
        strings.sorry_something_went_wrong
      );
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentSection = (
    title,
    description,
    document,
    slug,
    uploadText
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => moveToUpload(slug, document.status, document.path)}
        style={styles.documentContainer}
        accessibilityLabel={`Upload ${title}`}
      >
        <View style={styles.documentInfo}>
          <Text style={[styles.statusText, { color: document.color }]}>
            {document.status_name}
          </Text>
          <Text style={styles.uploadText}>{uploadText}</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={document.path}
            style={styles.documentImage}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={colors.theme_bg}
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Icon
            type={Icons.MaterialIcons}
            name="arrow-back"
            color={colors.theme_fg_two}
            style={styles.backIcon}
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {uploadStatus === 0 ? (
          <View style={styles.content}>
            <Text style={styles.title}>
              {strings.upload_your_documents} (4)
            </Text>
            {renderDocumentSection(
              strings.id_proof,
              strings.make_sure_that_every_details_of_the_document_is_clearly_visible,
              idProof,
              'id_proof',
              strings.upload_your_passport_or_driving_licence_or_any_one_id_proof
            )}
            {renderDocumentSection(
              strings.certificate,
              strings.make_sure_that_every_details_of_the_document_is_clearly_visible,
              vehicleCertificate,
              'vehicle_certificate',
              strings.upload_your_vehicle_registration_certificate
            )}
            {renderDocumentSection(
              strings.vehicle_insurance,
              strings.make_sure_that_every_details_of_the_document_is_clearly_visible,
              vehicleInsurance,
              'vehicle_insurance',
              strings.upload_your_vehicle_insurance_document
            )}
            {renderDocumentSection(
              strings.vehicle_image,
              strings.upload_your_vehicle_image,
              vehicleImage,
              'vehicle_image',
              strings.upload_your_vehicle_image_with_number_board
            )}
          </View>
        ) : (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              {strings.your_documents_are_uploaded_please_wait_admin_will_verify_your_documents}
            </Text>
            <TouchableOpacity
              onPress={goBack}
              style={styles.homeButton}
              activeOpacity={0.8}
              accessibilityLabel="Go to Home"
            >
              <Text style={styles.homeButtonText}>{strings.go_to_home}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <DropdownAlert ref={dropdownAlertRef} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lite_bg,
  },
  header: {
    height: 60,
    backgroundColor: colors.lite_bg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    ...Platform.select({
      ios: {
        paddingTop: 10,
      },
    }),
  },
  backButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    padding: 15,
  },
  title: {
    fontFamily: bold,
    color: colors.theme_fg_two,
    fontSize: f_xl,
    marginBottom: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: bold,
    color: colors.theme_fg_two,
    fontSize: f_l,
  },
  sectionDescription: {
    fontFamily: normal,
    color: colors.grey,
    fontSize: f_xs,
    marginTop: 5,
    marginBottom: 10,
  },
  documentContainer: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.theme_bg_three,
  },
  documentInfo: {
    flex: 0.7,
  },
  statusText: {
    fontFamily: bold,
    fontSize: f_s,
    marginBottom: 5,
  },
  uploadText: {
    fontFamily: normal,
    color: colors.grey,
    fontSize: f_xs,
  },
  imageContainer: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentImage: {
    width: 75,
    height: 75,
  },
  successContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontFamily: bold,
    color: colors.theme_fg_two,
    fontSize: f_s,
    textAlign: 'center',
    marginBottom: 20,
  },
  homeButton: {
    width: '100%',
    backgroundColor: colors.btn_color,
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    fontFamily: bold,
    color: colors.theme_fg_three,
    fontSize: f_m,
  },
});

export default connect(null, null)(memo(VehicleDocument));