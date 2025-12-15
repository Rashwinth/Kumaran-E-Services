import { AuthProvider } from "./AuthContext";
import { BranchProvider } from "./BranchContext";
import { AccountProvider } from "./AccountContext";
import { ProductProvider } from "./ProductContext";

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <BranchProvider>
        <ProductProvider>
          <AccountProvider>{children}</AccountProvider>
        </ProductProvider>
      </BranchProvider>
    </AuthProvider>
  );
};
