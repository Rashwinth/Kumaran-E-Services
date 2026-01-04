import { AuthProvider } from "./AuthContext";
import { BillingProvider } from "./BillingContext";
import { ProductProvider } from "./ProductContext";
import { CustomerProvider } from "./CustomerContext";

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <BillingProvider>
        <ProductProvider>
          <CustomerProvider>{children}</CustomerProvider>
        </ProductProvider>
      </BillingProvider>
    </AuthProvider>
  );
};
