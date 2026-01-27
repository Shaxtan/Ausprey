import { createContext, useContext, useState, useEffect } from "react";
import ApiService from "services/ApiService";
import PropTypes from "prop-types";

const AccountContext = createContext(null);

export function AccountProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  useEffect(() => {
    ApiService.getAccountDropdown((res) => {
      if (res?.data?.resultCode === 1 && Array.isArray(res.data.data)) {
        const list = res.data.data;
        setAccounts(list);

        if (!selectedAccountId && list.length > 0) {
          setSelectedAccountId(list[0].id);
        }
      } else {
        console.error("Failed to load account dropdown:", res);
      }
    });
  }, []);

  const value = {
    accounts,
    selectedAccountId,
    setSelectedAccountId,
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

AccountProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) {
    throw new Error("useAccount must be used inside AccountProvider");
  }
  return ctx;
}
