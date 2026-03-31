import { LoginPage } from '../features/auth/pages/LoginPage';
import { useAuthStore } from '../features/auth/store/auth.store';
import { HomePage } from '../features/delivery/pages/HomePage';

export function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return isAuthenticated ? <HomePage /> : <LoginPage />;
}
