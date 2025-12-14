import { AuthProvider } from "./AuthContext";
import { BranchProvider } from "./BranchContext";
import { AccountProvider } from "./AccountContext";

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <BranchProvider>
        <AccountProvider>{children}</AccountProvider>
      </BranchProvider>
    </AuthProvider>
  );
};
