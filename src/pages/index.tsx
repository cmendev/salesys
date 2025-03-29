import { useAuthStore } from "../store/authStore";
import LoginForm from "../components/LoginForm";
import Dashboard from "./dashboard";

const Home = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return isAuthenticated ? <Dashboard /> : <LoginForm />;
};

export default Home;