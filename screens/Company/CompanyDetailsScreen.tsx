import React, { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Linking,
  Alert,
} from "react-native";
import { useQuery } from "@apollo/client";
import { GET_COMPANY } from "../../src/graphql/queries/queries";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../src/navigation/NavigationTypes";
import ScreenNames from "../../src/navigation/ScreenNames";

type CompanyDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  ScreenNames.CompanyDetailsScreen
>;

type CompanyDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  ScreenNames.CompanyDetailsScreen
>;

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 40) / 2; // 20 padding on sides, 10 gap

export default function CompanyDetailsScreen() {
  const navigation = useNavigation<CompanyDetailsScreenNavigationProp>();
  const route = useRoute<CompanyDetailsScreenRouteProp>();
  const { companyId, companyName } = route.params;
  const [menuVisible, setMenuVisible] = useState(false);

  const { data } = useQuery(GET_COMPANY, {
    variables: { id: companyId },
  });

  const company = data?.company;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: companyName,
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="add" size={30} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, companyName]);

  const handleCall = () => {
    if (company?.phone) {
      Linking.openURL(`tel:${company.phone}`);
    } else {
      Alert.alert("Error", "No phone number available");
    }
  };

  const handleEmail = () => {
    if (company?.email) {
      Linking.openURL(`mailto:${company.email}`);
    } else {
      Alert.alert("Error", "No email address available");
    }
  };

  const handleWhatsApp = () => {
    if (company?.phone) {
      // Remove all non-numeric characters
      let cleanPhone = company.phone.replaceAll(/\D/g, "");

      // If the phone number starts with '0', replace it with '+20' (assuming Egypt country code)
      // or simply remove the leading '0' if you want to prepend a different country code manually.
      // WhatsApp requires the country code. If '0122...' is provided, it's likely a local number.
      // Adjust this logic based on your target region.
      // For now, let's assume if it starts with '0', we strip it and prepend '2' (Egypt example) or let user add country code.
      // A common pattern for local numbers starting with 0 is to replace 0 with country code.
      // Example: 01224588669 -> 201224588669 (for Egypt)
      // If you are unsure about the country, it's better to ask or use a library.
      // For this specific issue, if the user says "+0122...", it seems like some formatting issue.

      // Let's ensure we don't have a leading '+' if we already cleaned non-digits (which removed +).
      // But wait, if input was "+0122...", replaceAll(/\D/g, "") would result in "0122...".
      // WhatsApp needs country code. "0122..." is not a valid international number usually.

      // If the number is saved as "01224588669", it needs a country code.
      // I will assume a default country code if missing, or just pass it as is if it looks full.
      // However, the user mentioned "+01224588669" appearing.

      // Let's try to be robust:
      // 1. Clean non-digits.
      // 2. If it starts with '0', replace with '20' (Egypt) or your specific country code.
      //    (User's name "Lobna Elsawy" suggests Egypt context potentially).

      if (cleanPhone.startsWith("0")) {
        cleanPhone = "2" + cleanPhone; // Assuming Egypt (+20) and removing leading 0 is handled by just prepending 2 if 0 stays? No.
        // If 0122..., 20122... is correct for Egypt.
        // So 0122 -> 20122.
      }

      const whatsappUrl = `whatsapp://send?phone=${cleanPhone}`;

      Linking.canOpenURL(whatsappUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(whatsappUrl);
          } else {
            // Fallback to web URL if app is not installed
            return Linking.openURL(`https://wa.me/${cleanPhone}`);
          }
        })
        .catch((err) => Alert.alert("Error", "Could not open WhatsApp"));
    } else {
      Alert.alert("Error", "No phone number available for WhatsApp");
    }
  };

  const menuItems: {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    action: () => void;
  }[] = [
    {
      label: "Add Person",
      icon: "person-add-outline",
      action: () => {
        setMenuVisible(false);
        navigation.navigate(ScreenNames.CreatePersonScreen, {
          companyId,
          companyName,
        });
      },
    },
    {
      label: "Create Deal",
      icon: "cash-outline",
      action: () => {
        setMenuVisible(false);
        navigation.navigate(ScreenNames.CreateDealScreen, {
          companyId,
          companyName,
        });
      },
    },
    {
      label: "Book Appointment",
      icon: "calendar-outline",
      action: () => {
        setMenuVisible(false);
        // Navigate to BookAppointmentScreen with pre-filled companyId
        navigation.navigate(ScreenNames.BookAppointmentScreen, { companyId });
      },
    },
  ];

  const gridItems: {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    screen: any;
    params: any;
    color: string;
  }[] = [
    {
      id: "profile",
      title: "Profile",
      icon: "business-outline",
      screen: ScreenNames.CompanyProfileScreen,
      params: { companyId },
      color: "#4A90E2",
    },
    {
      id: "persons",
      title: "Persons",
      icon: "people-outline",
      screen: ScreenNames.PersonsScreen,
      params: { companyId, companyName },
      color: "#50E3C2",
    },
    {
      id: "deals",
      title: "Deals",
      icon: "pricetag-outline",
      screen: ScreenNames.DealsScreen,
      params: { companyId, companyName },
      color: "#F5A623",
    },
    {
      id: "appointments",
      title: "Appointments",
      icon: "calendar-outline",
      screen: ScreenNames.CompanyAppointmentsScreen,
      params: { companyId, companyName },
      color: "#9013FE",
    },
  ];

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(item.screen, item.params)}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: item.color + "20" }]}
      >
        <Ionicons name={item.icon} size={32} color={item.color} />
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
          <View style={[styles.actionIcon, { backgroundColor: "#e3f2fd" }]}>
            <Ionicons name="call-outline" size={24} color="#1976d2" />
          </View>
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
          <View style={[styles.actionIcon, { backgroundColor: "#e8f5e9" }]}>
            <Ionicons name="mail-outline" size={24} color="#388e3c" />
          </View>
          <Text style={styles.actionText}>Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
          <View style={[styles.actionIcon, { backgroundColor: "#e0f2f1" }]}>
            <Ionicons name="logo-whatsapp" size={24} color="#00695c" />
          </View>
          <Text style={styles.actionText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={gridItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
      />

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.menuContainer}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.menuItem}
                  onPress={item.action}
                >
                  <Ionicons name={item.icon} size={24} color="#333" />
                  <Text style={styles.menuText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "white",
    marginBottom: 10,
    elevation: 2,
  },
  actionButton: {
    alignItems: "center",
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  actionText: {
    fontSize: 12,
    color: "#555",
  },
  listContainer: {
    padding: 15,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    width: ITEM_WIDTH,
    height: ITEM_WIDTH, // Square
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuText: {
    fontSize: 18,
    marginLeft: 15,
    color: "#333",
  },
});
