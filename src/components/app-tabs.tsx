import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  // O app é sempre claro (branco com tons de azul).
  const colors = Colors.light;

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="financas">
        <NativeTabs.Trigger.Label>Finanças</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.pie.fill" md="pie_chart" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="recorrencias">
        <NativeTabs.Trigger.Label>Recorrências</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="arrow.triangle.2.circlepath" md="autorenew" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
