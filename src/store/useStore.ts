import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type IncomeFrequency = 'mensual' | 'quincenal' | 'semanal';
export type SavingsGoalPriority = 'alta' | 'media' | 'baja';
export type SavingsReminderFrequency = 'semanal' | 'quincenal' | 'mensual';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  income: number;
  incomeFrequency: IncomeFrequency;
  savingsGoalName: string;
  savingsGoalAmount: number;
  savingsGoalDate: string;
  savingsGoalPriority: SavingsGoalPriority;
  savingsGoalCurrentAmount: number;
  savingsRemindersEnabled: boolean;
  savingsRemindersFrequency: SavingsReminderFrequency;
  currency: string;
  onboarded: boolean;
  savingsGoalMigrated?: boolean;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  date: number; // Day of the month (1-31)
  category: string;
  paid: boolean;
  lastPaidMonth?: string; // YYYY-MM
}

export interface DailyExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  isAnt: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string; // YYYY-MM-DD
  icon?: string;
}

interface AppState {
  user: UserProfile | null;
  fixedExpenses: FixedExpense[];
  dailyExpenses: DailyExpense[];
  savingsGoals: SavingsGoal[];
  
  // Actions
  setUser: (user: Partial<UserProfile>) => void;
  addFixedExpense: (expense: Omit<FixedExpense, 'id' | 'paid'>) => void;
  updateFixedExpense: (id: string, expense: Partial<FixedExpense>) => void;
  deleteFixedExpense: (id: string) => void;
  markFixedExpensePaid: (id: string, month: string) => void;
  
  addDailyExpense: (expense: Omit<DailyExpense, 'id'>) => void;
  updateDailyExpense: (id: string, expense: Partial<DailyExpense>) => void;
  deleteDailyExpense: (id: string) => void;

  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  
  resetData: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      fixedExpenses: [],
      dailyExpenses: [],
      savingsGoals: [],
      
      setUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : userData as UserProfile
      })),
      
      addFixedExpense: (expense) => set((state) => ({
        fixedExpenses: [...state.fixedExpenses, { ...expense, id: crypto.randomUUID(), paid: false }]
      })),
      
      updateFixedExpense: (id, expense) => set((state) => ({
        fixedExpenses: state.fixedExpenses.map(e => e.id === id ? { ...e, ...expense } : e)
      })),
      
      deleteFixedExpense: (id) => set((state) => ({
        fixedExpenses: state.fixedExpenses.filter(e => e.id !== id)
      })),
      
      markFixedExpensePaid: (id, month) => set((state) => ({
        fixedExpenses: state.fixedExpenses.map(e => 
          e.id === id ? { ...e, paid: true, lastPaidMonth: month } : e
        )
      })),
      
      addDailyExpense: (expense) => set((state) => ({
        dailyExpenses: [...state.dailyExpenses, { ...expense, id: crypto.randomUUID() }]
      })),
      
      updateDailyExpense: (id, expense) => set((state) => ({
        dailyExpenses: state.dailyExpenses.map(e => e.id === id ? { ...e, ...expense } : e)
      })),
      
      deleteDailyExpense: (id) => set((state) => ({
        dailyExpenses: state.dailyExpenses.filter(e => e.id !== id)
      })),

      addSavingsGoal: (goal) => set((state) => ({
        savingsGoals: [...(state.savingsGoals || []), { ...goal, id: crypto.randomUUID() }]
      })),

      updateSavingsGoal: (id, goal) => set((state) => ({
        savingsGoals: (state.savingsGoals || []).map(g => g.id === id ? { ...g, ...goal } : g)
      })),

      deleteSavingsGoal: (id) => set((state) => ({
        savingsGoals: (state.savingsGoals || []).filter(g => g.id !== id)
      })),
      
      resetData: () => set({ user: null, fixedExpenses: [], dailyExpenses: [], savingsGoals: [] })
    }),
    {
      name: 'fintrack-storage',
    }
  )
);
