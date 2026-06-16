import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  FlatList, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const TradeContext = createContext();

function TradeProvider({ children }) {
  const [balance, setBalance] = useState(10000);
  const [positions, setPositions] = useState([]);
  const [userProfile, setUserProfile] = useState({
    username: 'Guest_Trader',
    email: 'guest@tforex.com',
    accountTier: 'Premium Demo Tier',
  });

  const openPosition = (pairSymbol, entryPrice, marginAmount, direction) => {
    if (marginAmount > balance) return false;
    setBalance((prev) => prev - marginAmount);

    const newPosition = {
      id: Math.random().toString(36).substring(7),
      pair: pairSymbol,
      entryPrice: entryPrice,
      margin: marginAmount,
      direction: direction,
      time: new Date().toLocaleTimeString(),
      pnl: 0,
    };

    setPositions((prev) => [newPosition, ...prev]);
    return true;
  };

  const closePosition = (positionId) => {
    const positionToClose = positions.find((pos) => pos.id === positionId);
    if (!positionToClose) return;

    const finalPayout = positionToClose.margin + positionToClose.pnl;
    setBalance((prev) => prev + finalPayout);
    setPositions((prev) => prev.filter((pos) => pos.id !== positionId));
  };

  return (
    <TradeContext.Provider value={{ userProfile, setUserProfile, balance, positions, setPositions, openPosition, closePosition }}>
      {children}
    </TradeContext.Provider>
  );
}

function useTrade() {
  return useContext(TradeContext);
}

function Header() {
  const { balance } = useTrade();
  return (
    <View style={styles.headerContainer}>
      <View style={styles.brandRow}>
        <View style={styles.logoCircleMini}><Text style={{ fontSize: 16 }}>🦈</Text></View>
        <Text style={styles.brandText}>TFOREX</Text>
      </View>
      <View style={styles.balanceBlock}>
        <Text style={styles.balanceLabel}>LIQUID ACCOUNT EQUITY</Text>
        <Text style={styles.balanceValue}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
      </View>
    </View>
  );
}

function LoginScreen({ navigation }) {
  const { setUserProfile } = useTrade();
  const [inputUser, setInputUser] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!inputUser || !inputEmail || !password) {
      alert('Authentication Failure: All profile configuration fields are required.');
      return;
    }

    setUserProfile({
      username: inputUser.trim(),
      email: inputEmail.trim().toLowerCase(),
      accountTier: 'VIP Alpha Tier Member',
    });

    navigation.navigate('Main');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollCenter} keyboardShouldPersistTaps="handled">
        <View style={styles.logoCircleOuter}>
          <View style={styles.logoCircleInner}><Text style={{ fontSize: 44 }}>🦈</Text></View>
        </View>
        <Text style={styles.brandName}>TFOREX</Text>
        <Text style={styles.tagline}>Institutional Trading Workspace</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>OPERATOR HANDLE (USERNAME)</Text>
          <TextInput 
            style={styles.loginInput} 
            placeholder="e.g. SharkTrader_99" 
            placeholderTextColor="#333" 
            value={inputUser}
            onChangeText={setInputUser}
            autoCorrect={false}
          />

          <Text style={styles.inputLabel}>SECURE AUDIT EMAIL</Text>
          <TextInput 
            style={styles.loginInput} 
            placeholder="developer@tforex.com" 
            placeholderTextColor="#333" 
            keyboardType="email-address"
            autoCapitalize="none"
            value={inputEmail}
            onChangeText={setInputEmail}
            autoCorrect={false}
          />

          <Text style={styles.inputLabel}>WORKSPACE ACCESS KEY (PASSWORD)</Text>
          <TextInput 
            style={styles.loginInput} 
            placeholder="••••••••••••" 
            placeholderTextColor="#333" 
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginBtnText}>INITIALIZE TERMINAL →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const INITIAL_PAIRS = [
  { id: '1', symbol: 'EUR / USD', price: 1.0852, isUp: true },
  { id: '2', symbol: 'GBP / USD', price: 1.2645, isUp: false },
  { id: '3', symbol: 'USD / JPY', price: 151.42, isUp: true },
];

function DashboardScreen({ navigation }) {
  const [forexPairs, setForexPairs] = useState(INITIAL_PAIRS);

  useEffect(() => {
    const interval = setInterval(() => {
      setForexPairs((prev) => prev.map((pair) => {
        const movement = (Math.random() - 0.5) * 0.002;
        return { ...pair, price: parseFloat((pair.price + movement).toFixed(pair.symbol.includes('JPY') ? 2 : 4)), isUp: movement >= 0 };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <Text style={styles.sectionTitle}>Live Watchlist</Text>
      <FlatList
        data={forexPairs}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TradeTab', { pair: item })}>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={[styles.price, { color: item.isUp ? '#00FF87' : '#FF3B30' }]}>{item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function TradeScreen({ route, navigation }) {
  const { balance, openPosition } = useTrade();
  const pair = route?.params?.pair || { symbol: 'EUR / USD', price: 1.0852 };
  const [amount, setAmount] = useState('');

  const execute = (direction) => {
    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0 || numericAmount > balance) {
      alert('Invalid margin amount or insufficient liquid equity funds.');
      return;
    }
    
    openPosition(pair.symbol, pair.price, numericAmount, direction);
    alert(`Success: Opened ${direction} position for ${pair.symbol}`);
    setAmount('');
    navigation.navigate('Portfolio');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <View style={styles.assetCard}>
          <Text style={styles.assetSymbol}>{pair.symbol}</Text>
          <Text style={styles.assetPrice}>Strike: ${pair.price}</Text>
        </View>
        <Text style={styles.label}>ENTER POSITION MARGIN ($)</Text>
        <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#444" keyboardType="numeric" value={amount} onChangeText={setAmount} />
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.tradeBtn, { backgroundColor: '#00FF87' }]} onPress={() => execute('BUY')}><Text style={styles.btnText}>BUY / LONG</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.tradeBtn, { backgroundColor: '#FF3B30' }]} onPress={() => execute('SELL')}><Text style={styles.btnText}>SELL / SHORT</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PortfolioScreen() {
  const { userProfile, positions, setPositions, closePosition, balance } = useTrade();

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) => prev.map((pos) => ({ ...pos, pnl: pos.pnl + (Math.random() - 0.5) * 4 })));
    }, 2000);
    return () => clearInterval(interval);
  }, [setPositions]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}><Text style={{ fontSize: 24 }}>🦈</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{userProfile.username}</Text>
          <Text style={styles.profileEmailText}>{userProfile.email}</Text>
          <Text style={styles.tier}>{userProfile.accountTier}</Text>
        </View>
      </View>
      <View style={styles.analyticsBar}>
        <Text style={styles.analyticsLabel}>TOTAL PORTFOLIO VALUE</Text>
        <Text style={styles.analyticsValue}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
      </View>
      <Text style={styles.sectionTitle}>Active Market Orders ({positions.length})</Text>
      <FlatList
        data={positions}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.symbol}>{item.pair} ({item.direction})</Text>
              <Text style={{ color: '#444', fontSize: 12, marginTop: 2 }}>Margin: ${item.margin}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: item.pnl >= 0 ? '#00FF87' : '#FF3B30', fontWeight: 'bold' }}>${item.pnl.toFixed(2)}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => closePosition(item.id)}><Text style={styles.closeText}>CLOSE POSITION</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = route.name === 'Watchlist' ? 'trending-up' : route.name === 'TradeTab' ? 'cash' : 'pie-chart';
          return <Ionicons name={focused ? iconName : `${iconName}-outline`} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1E90FF',
        tabBarInactiveTintColor: '#555555',
        tabBarStyle: { backgroundColor: '#0A0A0A', borderTopWidth: 1, borderTopColor: '#111' },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Watchlist" component={DashboardScreen} />
      <Tab.Screen name="TradeTab" options={{ title: 'Trade' }} component={TradeScreen} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar barStyle="light-content" />
      <TradeProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Main" component={MainTabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </TradeProvider>
    </View>
  );
}

const BLUE = '#1E90FF';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollCenter: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logoCircleOuter: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: BLUE, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoCircleInner: { width: 86, height: 86, borderRadius: 43, backgroundColor: '#1a1a2a', justifyContent: 'center', alignItems: 'center' },
  brandName: { fontSize: 34, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 6 },
  tagline: { color: '#8A8A8A', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginTop: 6, marginBottom: 40, textTransform: 'uppercase' },
  inputWrapper: { width: '100%', marginBottom: 30, gap: 6 },
  inputLabel: { color: BLUE, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginTop: 12 },
  loginInput: { backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#181818', borderRadius: 8, padding: 14, color: '#FFF', fontSize: 14 },
  loginBtn: { backgroundColor: BLUE, width: '100%', borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  loginBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 2 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#0A0A0A', borderBottomWidth: 1, borderColor: '#111' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircleMini: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1a1a2a', borderWidth: 1, borderColor: BLUE, justifyContent: 'center', alignItems: 'center' },
  brandText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 },
  balanceBlock: { alignItems: 'flex-end' },
  balanceLabel: { color: BLUE, fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  balanceValue: { color: '#00FF87', fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  sectionTitle: { color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 1, paddingHorizontal: 20, marginTop: 20, marginBottom: 12, textTransform: 'uppercase' },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: 18, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1a1a2e' },
  symbol: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  price: { fontSize: 16, fontWeight: 'bold' },
  assetCard: { backgroundColor: '#111', padding: 25, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 20, borderWidth: 1, borderColor: '#1a1a2e' },
  assetSymbol: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  assetPrice: { color: BLUE, fontSize: 14, marginTop: 4, fontWeight: '600' },
  label: { color: BLUE, fontSize: 10, letterSpacing: 1, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#050505', borderWidth: 1, borderColor: '#222', borderRadius: 12, color: '#FFF', fontSize: 24, textAlign: 'center', padding: 14, marginBottom: 20, fontWeight: 'bold' },
  btnRow: { flexDirection: 'row', gap: 12 },
  tradeBtn: { flex: 1, paddingVertical: 16, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', letterSpacing: 1 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0A0A', padding: 20, borderBottomWidth: 1, borderColor: '#111', gap: 14 },
  avatarCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#1a1a2a', borderWidth: 1, borderColor: BLUE, justifyContent: 'center', alignItems: 'center' },
  username: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  profileEmailText: { color: '#555', fontSize: 12, marginTop: 1 },
  tier: { color: BLUE, fontSize: 11, fontWeight: '700', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  analyticsBar: { backgroundColor: '#111', margin: 20, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1a1a2e' },
  analyticsLabel: { color: '#444', fontSize: 8, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  analyticsValue: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  closeBtn: { backgroundColor: 'rgba(255,59,48,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginTop: 8 },
  closeText: { color: '#FF3B30', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
});