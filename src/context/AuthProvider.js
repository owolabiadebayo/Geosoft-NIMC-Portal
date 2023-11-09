import { createContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(
    JSON.parse(localStorage.getItem("newauth")) || []
  );

  useEffect(() => {
    localStorage.setItem("newauth", JSON.stringify(auth));
  }, [auth]);

  const logout = async () => {
    // if used in more components, this should be in context
    // axios to /logout endpoint
    setAuth({});
    navigate("/");
  };

  const [au, setAu] = useState(null);
  const [uu, setUu] = useState(null);
  const [cv, setcv] = useState(null);
  const [tau, settAu] = useState(null);
  const [tuu, settUu] = useState(null);
  const [tcu, settcu] = useState(null);

  const all = {
    au: "",
    uu: "",
    uw: "",
    tau: "",
    tuu: "",
    tav: "",
    tuv: "",
    tcu: "",
    tvoucher: "",
    uvoucher: "",
  };

  const navigate = useNavigate();

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        logout,
        navigate,
        au,
        setAu,
        uu,
        setUu,
        all,
        cv,
        setcv,
        tau,
        settAu,
        tcu,
        settcu,
        tuu,
        settUu,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
