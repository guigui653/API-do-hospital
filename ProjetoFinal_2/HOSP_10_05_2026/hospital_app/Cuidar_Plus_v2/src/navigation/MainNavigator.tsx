import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../viewmodels/useLoginViewModel';

import LoginScreen             from '../screens/LoginScreen';
import TabNavigator            from './TabNavigator';
import EsqueciSenhaScreen      from '../screens/EsqueciSenhaScreen';
import CategoriaDetalhesScreen from '../screens/CategoriaDetalhesScreen';
import NovoPedidoScreen        from '../screens/NovoPedidoScreen';
import SelecaoAtendimentoScreen from '../screens/SelecaoAtendimentoScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function MainNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#007A72" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#007A72' },
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: { opacity: current.progress },
        }),
      }}
    >
      {isAuthenticated ? (

        <>
          <Stack.Screen name="Home" component={TabNavigator} />
          <Stack.Screen
            name="SelecaoAtendimento"
            component={SelecaoAtendimentoScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="CategoriaDetalhes"
            component={CategoriaDetalhesScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="NovoPedido"
            component={NovoPedidoScreen}
            options={{ gestureEnabled: true }}
          />
        </>
      ) : (

        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="EsqueciSenha"
            component={EsqueciSenhaScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="ResetarSenha"
            component={EsqueciSenhaScreen}
            options={{ gestureEnabled: true }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
