import { SQLiteProvider } from 'expo-sqlite';
import HomeScreen from './src/screens/HomeScreen';
import { initDb } from './src/database';

export default function App() {
  return (
    <SQLiteProvider databaseName="pieuvre-note.db" onInit={initDb}>
      <HomeScreen />
    </SQLiteProvider>
  );
}
