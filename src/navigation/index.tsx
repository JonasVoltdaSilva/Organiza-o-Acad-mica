import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { ActivityFormScreen } from "../screens/ActivityFormScreen";
import { CalendarScreen } from "../screens/CalendarScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { DisciplineFormScreen } from "../screens/DisciplineFormScreen";
import { DisciplineHubScreen } from "../screens/DisciplineHubScreen";
import { DisciplinesScreen } from "../screens/DisciplinesScreen";
import { ExamFormScreen } from "../screens/ExamFormScreen";
import { NoteEditorScreen } from "../screens/NoteEditorScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { StatsScreen } from "../screens/StatsScreen";
import { GlassTabBar } from "./GlassTabBar";
import { RootStackParamList, TabParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <GlassTabBar {...props} />}
    >
      <Tab.Screen name="Início" component={DashboardScreen} />
      <Tab.Screen name="Disciplinas" component={DisciplinesScreen} />
      <Tab.Screen name="Calendário" component={CalendarScreen} />
      <Tab.Screen name="Estatísticas" component={StatsScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="DisciplineHub" component={DisciplineHubScreen} />
      <Stack.Screen
        name="DisciplineForm"
        component={DisciplineFormScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="ActivityForm"
        component={ActivityFormScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="ExamForm"
        component={ExamFormScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="NoteEditor"
        component={NoteEditorScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ presentation: "modal", animation: "fade_from_bottom" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
    </Stack.Navigator>
  );
}
