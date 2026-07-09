import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { Plan } from './pages/Plan';
import { Groceries } from './pages/Groceries';
import { Profile } from './pages/Profile';
import { RecipeDetail } from './pages/RecipeDetail';
import { CreateRecipe } from './pages/CreateRecipe';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-cream">
        <div className="animate-pulse text-brand-olive font-serif text-2xl italic">Saveur...</div>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/groceries" element={<Groceries />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/create-recipe" element={<CreateRecipe />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
