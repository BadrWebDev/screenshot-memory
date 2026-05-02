import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { getScreenshots } from './src/services/api';

export default function App() {
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScreenshots();
  }, []);

  const fetchScreenshots = async () => {
    try {
      const data = await getScreenshots();
      console.log('API response:', JSON.stringify(data));
      setScreenshots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('Error fetching:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.summary}>{item.summary}</Text>
      <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Memory</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <FlatList
          data={screenshots}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>No screenshots yet</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', paddingHorizontal: 16, marginBottom: 16 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12 },
  category: { fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 4 },
  summary: { fontSize: 15, color: '#fff', lineHeight: 22 },
  date: { fontSize: 12, color: '#555', marginTop: 8 },
  empty: { color: '#555', textAlign: 'center', marginTop: 40 },
});