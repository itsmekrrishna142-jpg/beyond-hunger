import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function DebugScreen() {
  const [results, setResults] = useState<any[]>([]);

  const testConnection = async (url: string) => {
    try {
      const start = Date.now();
      const response = await fetch(url);
      const end = Date.now();
      
      const result = {
        url,
        status: response.status,
        statusText: response.statusText,
        responseTime: `${end - start}ms`,
        timestamp: new Date().toISOString(),
        success: response.ok
      };
      
      setResults(prev => [result, ...prev]);
    } catch (error: any) {
      const result = {
        url,
        error: error.message,
        timestamp: new Date().toISOString(),
        success: false
      };
      setResults(prev => [result, ...prev]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Connection Debugger</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => testConnection('https://beyond-hunger.onrender.com/api/health')}
      >
        <Text style={styles.buttonText}>Test Server Health</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => testConnection('https://beyond-hunger.onrender.com/api/test-db')}
      >
        <Text style={styles.buttonText}>Test Database</Text>
      </TouchableOpacity>

      {results.map((result, index) => (
        <View key={index} style={[
          styles.result, 
          result.success ? styles.success : styles.error
        ]}>
          <Text style={styles.resultText}>URL: {result.url}</Text>
          <Text style={styles.resultText}>Status: {result.status || 'Error'}</Text>
          <Text style={styles.resultText}>Time: {result.responseTime}</Text>
          <Text style={styles.resultText}>Time: {result.timestamp}</Text>
          {result.error && (
            <Text style={styles.errorText}>Error: {result.error}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  button: { 
    backgroundColor: '#007AFF', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10 
  },
  buttonText: { color: 'white', textAlign: 'center' },
  result: { padding: 10, borderRadius: 5, marginBottom: 10 },
  success: { backgroundColor: '#d4edda' },
  error: { backgroundColor: '#f8d7da' },
  resultText: { fontSize: 12 },
  errorText: { color: '#721c24', fontWeight: 'bold' }
});