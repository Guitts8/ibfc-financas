import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalanceCard } from '@/components/finance/balance-card';
import { TransactionForm } from '@/components/finance/transaction-form';
import { TransactionRow } from '@/components/finance/transaction-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { useTransactions } from '@/hooks/use-transactions';
import { addTransaction } from '@/firebase/transactions';
import type { NewTransaction } from '@/types/finance';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const { transactions, totals, loading, error } = useTransactions();
  const [formOpen, setFormOpen] = useState(false);

  const nome = user?.displayName?.trim().split(' ')[0] || 'irmão(ã)';

  async function handleCreate(input: NewTransaction) {
    if (!user) return;
    await addTransaction(user.uid, input);
    setFormOpen(false);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <ThemedText type="smallBold" style={styles.eyebrow}>
              IBFC FINANÇAS
            </ThemedText>
            <ThemedText type="subtitle">Olá, {nome}</ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={signOut}
            style={({ pressed }) => [styles.logout, { opacity: pressed ? 0.6 : 1 }]}>
            <ThemedText type="smallBold" themeColor="expense">
              Sair
            </ThemedText>
          </Pressable>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => <TransactionRow transaction={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <BalanceCard totals={totals} />
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Transações recentes
              </ThemedText>
              {error && (
                <ThemedText type="small" themeColor="expense">
                  {error}
                </ThemedText>
              )}
            </View>
          }
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: theme.border }]} />
          )}
          ListEmptyComponent={
            !loading ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                Nenhuma transação ainda. Toque em “+” para adicionar a primeira.
              </ThemedText>
            ) : null
          }
        />

        {/* Botão flutuante para adicionar transação */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Nova transação"
          onPress={() => setFormOpen(true)}
          style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.85 : 1 }]}>
          <ThemedText style={styles.fabIcon}>+</ThemedText>
        </Pressable>
      </SafeAreaView>

      <Modal
        visible={formOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFormOpen(false)}>
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalSheet}>
            <SafeAreaView edges={['bottom']}>
              <View style={styles.modalHandle} />
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Nova transação
              </ThemedText>
              <TransactionForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} />
            </SafeAreaView>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  headerText: {
    gap: Spacing.half,
  },
  eyebrow: {
    color: Brand.blue,
    letterSpacing: 1.5,
  },
  logout: {
    paddingVertical: Spacing.one,
    paddingLeft: Spacing.three,
  },
  listContent: {
    paddingBottom: BottomTabInset + Spacing.six + Spacing.four,
  },
  listHeader: {
    gap: Spacing.three,
  },
  sectionTitle: {
    marginTop: Spacing.two,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  empty: {
    paddingVertical: Spacing.four,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: Spacing.one,
    bottom: BottomTabInset + Spacing.three,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '300',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    maxHeight: '90%',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9BA1A6',
    marginBottom: Spacing.three,
  },
  modalTitle: {
    marginBottom: Spacing.three,
  },
});
