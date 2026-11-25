import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import { initDb } from './src/database';

export default function App() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="pieuvre-note.db" onInit={initDb}>
        <HomeScreen />
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
