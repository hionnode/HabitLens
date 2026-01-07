---
trigger: always_on
---

# GEMINI.md — React Native Project Guidelines

> Coding agent instructions for this React Native + Kotlin project.

## Stack Overview

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 52+ (prebuild/bare workflow) |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router v4 |
| State | Zustand (client) + TanStack Query (server) |
| Styling | StyleSheet.create() |
| Native Modules | Expo Modules API (Kotlin/Swift) |
| Forms | React Hook Form + Zod |
| HTTP | Fetch (no axios) |

---

## Project Structure

```
├── app/                      # Expo Router (file-based routing)
│   ├── _layout.tsx          # Root layout, providers
│   ├── index.tsx            # Entry redirect
│   ├── (tabs)/              # Tab navigator group
│   │   ├── _layout.tsx
│   │   ├── index.tsx        # Home tab
│   │   └── profile.tsx
│   ├── (auth)/              # Auth stack group
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── [id].tsx             # Dynamic route
├── src/
│   ├── components/
│   │   ├── ui/              # Primitives (Button, Input, Card)
│   │   └── [feature]/       # Feature-specific components
│   ├── hooks/               # Custom hooks
│   ├── stores/              # Zustand stores
│   ├── lib/
│   │   ├── api.ts           # API client
│   │   ├── utils.ts         # Pure utility functions
│   │   └── constants.ts     # App constants
│   ├── types/               # Shared TypeScript types
│   └── native/              # JS bindings for native modules
├── modules/                  # Expo native modules (Kotlin/Swift)
│   └── my-module/
│       ├── android/
│       │   └── src/main/java/expo/modules/mymodule/
│       ├── ios/
│       └── src/              # Module JS interface
├── assets/
└── app.json
```

---

## Code Conventions

### File Naming
- Components: `PascalCase.tsx` → `ProfileCard.tsx`
- Hooks: `camelCase.ts` with `use` prefix → `useAuth.ts`
- Utilities: `camelCase.ts` → `formatDate.ts`
- Types: `camelCase.ts` or co-located → `types.ts`
- Stores: `camelCase.ts` → `authStore.ts`

### Component Template
```tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';

// ─────────────────────────────────────────────
// Types (co-locate unless shared across files)
// ─────────────────────────────────────────────
interface Props {
  user: User;
  onPress?: () => void;
}

// ─────────────────────────────────────────────
// Component (always named export)
// ─────────────────────────────────────────────
export function ProfileCard({ user, onPress }: Props) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handlePress = () => {
    onPress?.();
    router.push(`/user/${user.id}`);
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Text style={styles.name}>{user.name}</Text>
    </Pressable>
  );
}

// ─────────────────────────────────────────────
// Styles (always at bottom, always StyleSheet)
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
});
```

### Import Order
```tsx
// 1. React/React Native
import { useState, useCallback } from 'react';
import { View, Text } from 'react-native';

// 2. Expo
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

// 3. Third-party
import { useQuery } from '@tanstack/react-query';

// 4. Internal (use @/ alias)
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';

// 5. Types
import type { User } from '@/types';
```

### Path Aliases
Always use `@/` for src imports. Configure in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## React Native Rules

### Styling — Hard Rules
```tsx
// ✅ ALWAYS use StyleSheet.create()
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});

// ✅ Dynamic values inline are OK
<View style={[styles.box, { opacity: isVisible ? 1 : 0 }]} />

// ❌ NEVER inline static styles
<View style={{ padding: 16, flex: 1 }} />

// ❌ NEVER use style objects outside StyleSheet
const badStyles = { container: { flex: 1 } }; // No optimization
```

### Lists — Non-Negotiable
```tsx
// ✅ ALWAYS use FlashList or FlatList for scrollable lists
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={({ item }) => <Item data={item} />}
  estimatedItemSize={80}
  keyExtractor={(item) => item.id}
/>

// ❌ NEVER use .map() for scrollable content
{items.map((item) => <Item key={item.id} />)} // WRONG
```

### Pressable > TouchableOpacity
```tsx
// ✅ Use Pressable (modern, more control)
<Pressable
  onPress={handlePress}
  style={({ pressed }) => [
    styles.button,
    pressed && styles.pressed,
  ]}
>
  <Text>Press me</Text>
</Pressable>

// ❌ Avoid TouchableOpacity (legacy)
```

### Safe Areas & Keyboard
```tsx
// Always wrap screens with SafeAreaView
import { SafeAreaView } from 'react-native-safe-area-context';

// Always handle keyboard for forms
import { KeyboardAvoidingView, Platform } from 'react-native';

export function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* form content */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

### Images
```tsx
// ✅ Always use expo-image (not RN Image)
import { Image } from 'expo-image';

<Image
  source={{ uri: url }}
  style={styles.image}
  contentFit="cover"
  placeholder={blurhash}
  transition={200}
/>
```

---

## State Management

### Decision Tree
```
Is it UI state local to one component?
  → useState

Is it shared between 2-3 nearby components?
  → lift state up, pass as props

Is it global app state (auth, theme, settings)?
  → Zustand

Is it server data (API responses)?
  → TanStack Query
```

### Zustand Store Template
```tsx
// stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user, token } = await api.post('/auth/login', { email, password });
          api.setToken(token);
          set({ user, token, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        api.setToken(null);
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
```

### TanStack Query Template
```tsx
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User } from '@/types';

// Query keys factory
export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
};

// Fetch single user
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => api.get<User>(`/users/${id}`),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

// Fetch all users
export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => api.get<User[]>('/users'),
  });
}

// Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User> & { id: string }) =>
      api.patch<User>(`/users/${data.id}`, data),
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
```

---

## Navigation (Expo Router)

### Layout Structure
```tsx
// app/_layout.tsx — Root layout
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000,
    },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
```

```tsx
// app/(tabs)/_layout.tsx — Tab navigator
import { Tabs } from 'expo-router';
import { Home, User } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
```

### Navigation Actions
```tsx
import { useRouter, useLocalSearchParams, Link, Redirect } from 'expo-router';

// Programmatic navigation
const router = useRouter();
router.push('/profile/123');       // Push to stack
router.replace('/home');           // Replace current screen
router.back();                     // Go back
router.dismissAll();               // Dismiss all modals

// Get route params
const { id } = useLocalSearchParams<{ id: string }>();

// Declarative navigation
<Link href="/settings" asChild>
  <Pressable>
    <Text>Settings</Text>
  </Pressable>
</Link>

// Redirect (in component body)
if (!isAuthenticated) {
  return <Redirect href="/login" />;
}
```

---

## API Layer

### API Client
```tsx
// lib/api.ts
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const message = await response.text();
      throw new ApiError(response.status, message);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GE