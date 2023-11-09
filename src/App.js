import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/Home";
import Layout from "./components/Layout";
import Verify from "./components/verify";
import Users from "./components/Users";
import Missing from "./components/Missing";
import Unauthorized from "./components/Unauthorized";
import View from "./components/View";
import LinkPage from "./components/LinkPage";
import RequireAuth from "./components/RequireAuth";
import { Routes, Route } from "react-router-dom";
import Createuser from "./components/Createuser";
import Units from "./components/Units";
import Changepassword from "./components/Changepassword";
import Documentation from "./components/Documentation";
import Payment from "./components/Payment";
import EmailVerify from "./components/EmailVerify";
import Forgotpassword from "./components/Forgotpassword";

const ROLES = {
  User: 2001,
  Ent: 1984,
  Admin: 5150,
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgotpassword" element={<Forgotpassword />} />
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="/users/:id/verify/:token" element={<EmailVerify />} />

        {/* we want to protect these routes */}
        <Route
          element={
            <RequireAuth allowedRoles={[ROLES.User, ROLES.Admin, ROLES.Ent]} />
          }
        >
          <Route path="/" element={<Home />} />
        </Route>

        <Route
          element={
            <RequireAuth allowedRoles={[ROLES.User, ROLES.Admin, ROLES.Ent]} />
          }
        >
          <Route path="verify" element={<Verify />} />
        </Route>

        <Route
          element={<RequireAuth allowedRoles={[ROLES.Admin, ROLES.Ent]} />}
        >
          <Route path="users" element={<Users />} />
        </Route>
        <Route
          element={<RequireAuth allowedRoles={[ROLES.Admin, ROLES.Ent]} />}
        >
          <Route path="Documentation" element={<Documentation />} />
        </Route>

        <Route
          element={<RequireAuth allowedRoles={[ROLES.Admin, ROLES.Ent]} />}
        >
          <Route path="createuser" element={<Createuser />} />
        </Route>

        <Route
          element={
            <RequireAuth allowedRoles={[ROLES.User, ROLES.Admin, ROLES.Ent]} />
          }
        >
          <Route path="view" element={<View />} />
        </Route>

        <Route
          element={
            <RequireAuth allowedRoles={[ROLES.User, ROLES.Admin, ROLES.Ent]} />
          }
        >
          <Route path="units" element={<Units />} />
        </Route>

        <Route
          element={
            <RequireAuth allowedRoles={[ROLES.User, ROLES.Admin, ROLES.Ent]} />
          }
        >
          <Route path="payment" element={<Payment />} />
        </Route>

        <Route
          element={
            <RequireAuth allowedRoles={[ROLES.User, ROLES.Admin, ROLES.Ent]} />
          }
        >
          <Route path="password" element={<Changepassword />} />
        </Route>

        {/* catch all */}
        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  );
}

export default App;
