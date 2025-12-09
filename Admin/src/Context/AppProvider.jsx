import { AuthProvider } from "./AuthContext";
import { BranchProvider } from "./BranchContext";

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <BranchProvider>{children}</BranchProvider>
    </AuthProvider>
  );
};
