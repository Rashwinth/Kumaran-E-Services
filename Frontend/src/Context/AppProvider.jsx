import { AuthProvider } from "./AuthContext";
import { BillingProvider } from "./BillingContext";
import { ProductProvider } from "./ProductContext";

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <BillingProvider>
        <ProductProvider>{children}</ProductProvider>
      </BillingProvider>
    </AuthProvider>
  );
};
