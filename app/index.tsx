// Removed NavigationContainer to avoid nesting
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import AppNavigator from './navigation/AppNavigator';
import ReduxProvider from './navigation/ReduxProvider';
import CreateGroup from './screens/CreateGroup/CreateGroup';
import GroupDetails from './screens/GroupDetails/GroupDetails';

const Stack = createStackNavigator();

export default function Index() {
  return (
    <ReduxProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen name="MainTabs" component={AppNavigator} />
  <Stack.Screen name="CreateGroup" component={CreateGroup} options={{ headerShown: true, title: 'Create Group' }} />
  <Stack.Screen name="GroupDetails" component={GroupDetails} options={{ headerShown: true, title: 'Group Details' }} />
      </Stack.Navigator>
    </ReduxProvider>
  );
}

