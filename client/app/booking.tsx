import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BookingScreen() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState({
    title: "Essential Solo Portrait Session",
    price: 100,
    duration: "1 hour"
  });

  const services = [
    {
      id: 1,
      title: "Essential Solo Portrait Session",
      price: 100,
      duration: "1 hour"
    },
    {
      id: 2,
      title: "Premium Portrait Experience",
      price: 200,
      duration: "2 hours"
    },
    {
      id: 3,
      title: "Couples & Engagement Session",
      price: 150,
      duration: "1.5 hours"
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Book Your Session</Text>
      <Text style={styles.subtitle}>Select your preferred photography package</Text>

      <View style={styles.servicesContainer}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.serviceOption,
              selectedService.title === service.title && styles.serviceOptionSelected
            ]}
            onPress={() => setSelectedService(service)}
          >
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.title}</Text>
              <Text style={styles.serviceDuration}>{service.duration}</Text>
            </View>
            <Text style={styles.servicePrice}>£{service.price}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service:</Text>
          <Text style={styles.summaryValue}>{selectedService.title}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration:</Text>
          <Text style={styles.summaryValue}>{selectedService.duration}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total:</Text>
          <Text style={styles.summaryTotal}>£{selectedService.price}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/payment')}
      >
        <Text style={styles.buttonText}>Proceed to Payment</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        You'll be able to select your preferred date and time after payment confirmation.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  servicesContainer: {
    marginBottom: 30,
  },
  serviceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  serviceOptionSelected: {
    borderColor: '#FF0000',
    backgroundColor: '#fff5f5',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  summaryTotal: {
    fontSize: 20,
    color: '#FF0000',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FF0000',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});