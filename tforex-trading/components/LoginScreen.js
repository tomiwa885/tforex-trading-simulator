import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoCircleOuter}><View style={styles.logoCircleInner}><Text style={styles.shark}>🦈</Text></View></View>
        <Text style={styles.brandName}>TFOREX</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Main')}>
          <Text style={styles.loginBtnText}>LAUNCH SIMULATOR →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const BLUE = '#1E90FF';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logoCircleOuter: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: BLUE, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoCircleInner: { width: 104, height: 104, borderRadius: 52, backgroundColor: '#1a1a2a', justifyContent: 'center', alignItems: 'center' },
  shark: { fontSize: 50 },
  brandName: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 6, marginBottom: 40 },
  loginBtn: { backgroundColor: BLUE, width: '100%', borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  loginBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15, letterSpacing: 2 },
});