import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ServicesScreen() {
  const router = useRouter();

  const services = [
    {
      id: 1,
      title: "Essential Solo Portrait Session",
      price: "£100",
      duration: "1 hour",
      description: "Professional solo portrait photography session perfect for professional headshots, social media, or personal keepsakes.",
      features: ["30+ edited digital photos", "1-hour shooting time", "3 outfit changes", "Basic retouching"]
    },
    {
      id: 2,
      title: "Premium Portrait Experience",
      price: "£200",
      duration: "2 hours",
      description: "Extended session with multiple locations and professional lighting setup for the perfect portraits.",
      features: ["60+ edited digital photos", "2-hour shooting time", "Multiple locations", "Advanced retouching", "Print release"]
    },
    {
      id: 3,
      title: "Couples & Engagement Session",
      price: "£150",
      duration: "1.5 hours",
      description: "Capture your special moments with a dedicated couples photography session.",
      features: ["40+ edited digital photos", "1.5-hour shooting time", "2 locations", "Online gallery", "Social media previews"]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Our Photography Services</Text>
      <Text style={styles.subtitle}>Professional portraits that tell your story</Text>
      
      {services.map((service) => (
        <View key={service.id} style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.servicePrice}>{service.price}</Text>
          </View>
          <Text style={styles.serviceDuration}>{service.duration}</Text>
          <Text style={styles.serviceDescription}>{service.description}</Text>
          
          <View style={styles.featuresContainer}>
            {service.features.map((feature, index) => (
              <Text key={index} style={styles.feature}>• {feature}</Text>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.push('/booking')}
          >
            <Text style={styles.buttonText}>Book This Session</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>Need a Custom Package?</Text>
        <Text style={styles.contactText}>Contact us for personalized photography sessions tailored to your needs.</Text>
      </View>
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
  serviceCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
    color: '#333',
  },
  servicePrice: {
    fontSize: 24,
    color: '#FF0000',
    fontWeight: 'bold',
  },
  serviceDuration: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    fontWeight: '600',
  },
  serviceDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  feature: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#FF0000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactInfo: {
    backgroundColor: '#e9ecef',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});