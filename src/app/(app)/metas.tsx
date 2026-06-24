import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoalCard } from '@/components/finance/goal-card';
import { GoalContribute } from '@/components/finance/goal-contribute';
import { GoalForm } from '@/components/finance/goal-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { addGoal, contributeToGoal, deleteGoal, updateGoal } from '@/firebase/goals';
import { useTheme } from '@/hooks/use-theme';
import { useGoals } from '@/hooks/use-goals';
import type { Goal, NewGoal } from '@/types/finance';
import { formatCurrency } from '@/utils/format';

export default function MetasScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { goals, loading, error } = useGoals();

  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributeFor, setContributeFor] = useState<Goal | null>(null);

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  function openCreate() {
    setEditingGoal(null);
    setMode('form');
  }

  function openEdit(goal: Goal) {
    setEditingGoal(goal);
    setMode('form');
  }

  function backToList() {
    setMode('list');
    setEditingGoal(null);
  }

  async function handleSubmit(input: NewGoal) {
    if (!user) return;
    if (editingGoal) await updateGoal(user.uid, editingGoal.id, input);
    else await addGoal(user.uid, input);
    backToList();
  }

  async function handleDelete() {
    if (!user || !editingGoal) return;
    await deleteGoal(user.uid, editingGoal.id);
    backToList();
  }

  async function handleContribute(delta: number) {
    if (!user || !contributeFor) return;
    await contributeToGoal(user.uid, contributeFor.id, delta);
    setContributeFor(null);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText type="smallBold" style={styles.eyebrow}>
            IBFC FINANÇAS
          </ThemedText>
          <ThemedText type="subtitle">{mode === 'form' ? (editingGoal ? 'Editar meta' : 'Nova meta') : 'Metas'}</ThemedText>
          {mode === 'list' && (
            <ThemedText type="small" themeColor="textSecondary">
              {goals.length > 0
                ? `Você já guardou ${formatCurrency(totalSaved)} em ${goals.length} ${goals.length === 1 ? 'meta' : 'metas'}.`
                : 'Crie metas para guardar dinheiro com um objetivo.'}
            </ThemedText>
          )}
        </View>

        {error && (
          <ThemedText type="small" themeColor="expense">
            {error}
          </ThemedText>
        )}

        {mode === 'form' ? (
          <GoalForm
            key={editingGoal?.id ?? 'new'}
            initial={editingGoal ?? undefined}
            onSubmit={handleSubmit}
            onCancel={backToList}
            onDelete={editingGoal ? handleDelete : undefined}
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {loading && goals.length === 0 ? (
              <View style={styles.placeholder}>
                <ActivityIndicator color={Brand.blue} />
              </View>
            ) : (
              goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onContribute={setContributeFor} onEdit={openEdit} />
              ))
            )}

            <Pressable
              accessibilityRole="button"
              onPress={openCreate}
              style={({ pressed }) => [
                styles.addButton,
                { borderColor: theme.tint, opacity: pressed ? 0.7 : 1 },
              ]}>
              <ThemedText type="smallBold" style={{ color: theme.tint }}>
                + Nova meta
              </ThemedText>
            </Pressable>
          </ScrollView>
        )}
      </SafeAreaView>

      <GoalContribute
        key={contributeFor?.id ?? 'none'}
        goal={contributeFor}
        onClose={() => setContributeFor(null)}
        onSubmit={handleContribute}
      />
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
    gap: Spacing.half,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  eyebrow: {
    color: Brand.blue,
    letterSpacing: 1.5,
  },
  listContent: {
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  placeholder: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
  },
  addButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
});
