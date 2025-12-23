import { AuthProvider } from "./AuthContext";
import { BillingProvider } from "./BillingContext";

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <BillingProvider>{children}</BillingProvider>
    </AuthProvider>
  );
};
