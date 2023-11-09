import { Fragment, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { NavLink } from "react-router-dom";
import React, { useEffect } from "react";
import Modal from "react-modal";
import {
  Bars3Icon,
  BellIcon,
  XMarkIcon,
  UserCircleIcon,
  CheckIcon,
  EyeIcon,
  UsersIcon,
  BookOpenIcon,
  LockClosedIcon,
  UserPlusIcon,
  HomeIcon,
  CreditCardIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import useAuth from "../hooks/useAuth";
import Greeting from "./Greeting";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import "./ModalStyles.css";
import { BsFillLockFill } from "react-icons/bs";
import { FaTicketAlt, FaPlusSquare } from "react-icons/fa";
import { useTable, usePagination, useGlobalFilter } from "react-table";

function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length;

  return (
    <span>
      Search:{" "}
      <input
        value={globalFilter || ""}
        onChange={(e) => {
          setGlobalFilter(e.target.value || undefined);
        }}
        placeholder={`${count} records...`}
        style={{
          fontSize: "1.1rem",
          padding: "0.2rem",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      />
    </span>
  );
}

const teams = [
  { name: "Change Password", to: "/password", icon: LockClosedIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

Modal.setAppElement("#root");

export default function Users() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { auth, setAuth } = useAuth();
  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("newauth");
  };
  const roles = auth?.roles;
  const entID = auth.result.entID;
  const hasAdminRole = roles.includes(5150);
  const hasEntRole = roles.includes(1984);
  const hasUserRole = roles.includes(2001);

  const rawNavigation = [
    { name: "Home", to: "/", icon: HomeIcon, current: false },
    { name: "Verify", to: "/verify", icon: CheckIcon, current: false },
    { name: "View Verification", to: "/view", icon: EyeIcon, current: false },
    { name: "Units", to: "/units", icon: CreditCardIcon, current: false },
    { name: "Payments", to: "/payment", icon: WalletIcon, current: false },
    { name: "View Users", to: "/users", icon: UsersIcon, current: true },
    {
      name: "Create User",
      to: "/createuser",
      icon: UserPlusIcon,
      current: false,
    },
    {
      name: "API Documentation",
      to: "/documentation",
      icon: BookOpenIcon,
      current: false,
    },
    {
      name: "Change Password",
      to: "/password",
      icon: LockClosedIcon,
      current: false,
    },
  ];

  const navigation = rawNavigation.filter((item) => {
    if (item.name === "Units" || item.name === "Payments") {
      // Show 'Units' under specific conditions
      return (
        (typeof auth.result.entID === "undefined" && hasAdminRole) ||
        (typeof auth.result.entID === "undefined" && hasUserRole) ||
        (typeof auth.result.entID !== "undefined" && hasEntRole) ||
        (typeof auth.result.entID !== "undefined" && hasAdminRole)
      );
    } else if (
      item.name === "View Users" ||
      item.name === "Create User" ||
      item.name === "API Documentation"
    ) {
      // Only include these items if the user has the Admin or Ent roles
      return hasAdminRole || hasEntRole;
    } else {
      // Include all other items
      return true;
    }
  });
  const axiosPrivate = useAxiosPrivate();
  const authEmail = auth?.user;

  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [msg2, setMsg2] = useState("");

  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const closeModal = () => {
    setConfirmationOpen(false);
  };

  const [passwordError, setPasswordError] = useState("");

  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const openPwdModal = (email) => {
    setPasswordData((prevState) => ({
      ...prevState,
      email,
    }));
    setPwdModalOpen(true);
  };

  const closePwdModal = () => {
    setPasswordData({
      password: "",
      confirmPassword: "",
    });
    setPasswordError("");
    setPwdModalOpen(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    const { email, password, confirmPassword } = passwordData;

    if (password !== confirmPassword) {
      setPasswordError("Password and confirm password do not match!");
      return;
    }

    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/;
    if (!regex.test(password)) {
      setPasswordError(
        "Invalid password. It should contain at least one lowercase letter, one uppercase letter, one numeric digit, one special character and it should be at least eight characters long."
      );
      return;
    }

    try {
      await axiosPrivate.post("/changePassword", {
        email,
        pwd: password,
      });
      alert("User password changed successfully");
      setPasswordError("");
      closePwdModal();
    } catch (error) {
      if (error.response) {
        setPasswordError(error.response.data);
      } else if (error.request) {
        setPasswordError(error.request);
      } else {
        setPasswordError(error.message);
      }
    }
  };

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    index: -1,
    selectedRole: "",
  });

  const ROLES_LIST = {
    Admin: 5150,
    Ent: 1984,
    User: 2001,
    Permit: 3600,
  };

  const fetchUserData = async () => {
    try {
      if (hasAdminRole) {
        const response = await axiosPrivate.get("/fetchuser");
        setUserData(response.data);
        setLoading(false);
      }
      if (hasEntRole) {
        axiosPrivate
          .post("/fetchuser", {
            entID: entID,
          })
          .then((response) => {
            //console.log(response.data.mergedData);
            setUserData(response.data.mergedData);
            setLoading(false);
          })
          .catch((error) => {
            console.log(error);
            setLoading(false);
          });
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleRoleChange = (event, index) => {
    const selectedRole = event.target.value;
    setConfirmationData({ index, selectedRole });
    setConfirmationOpen(true);
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const confirmUpdateRoles = async () => {
    const { index, selectedRole } = confirmationData;
    setConfirmationOpen(false);

    const updatedUserData = [...userData];
    const updatedUser = { ...updatedUserData[index] };

    switch (selectedRole) {
      case "Administrator":
        updatedUser.roles = {
          Admin: 5150,
        };
        break;
      case "Enterprise":
        updatedUser.roles = {
          Ent: 1984,
        };
        break;
      case "Permit":
        updatedUser.roles = {
          Permit: 3600,
        };
        break;
      default:
        updatedUser.roles = {
          User: 2001,
        };
    }

    updatedUser.selectedRole = selectedRole;
    updatedUserData[index] = updatedUser;
    setUserData(updatedUserData);

    try {
      await axiosPrivate.put("/users", {
        email: updatedUser.email,
        roles: updatedUser.roles,
      });
      await fetchUserData();
    } catch (error) {
      console.error("Error updating user roles:", error.message);
    }
  };

  const unitOptions = [
    { label: "Choose one", value: "" },
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
    { label: "7", value: "7" },
    { label: "8", value: "8" },
    { label: "9", value: "9" },
    { label: "10", value: "10" },
    { label: "20", value: "20" },
    { label: "30", value: "30" },
    { label: "40", value: "40" },
    { label: "50", value: "50" },
    { label: "60", value: "60" },
    { label: "70", value: "70" },
    { label: "80", value: "80" },
    { label: "90", value: "90" },
    { label: "100", value: "100" },
    { label: "500", value: "500" },
    { label: "1000", value: "1000" },
  ];

  const handleChange2 = ({ currentTarget: input }) => {
    const selectedAmount = parseInt(input.value);
    setData({ ...data, [input.name]: selectedAmount });
  };

  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [unitData, setUnitData] = useState({
    email: "",
    amount: "",
  });

  const openUnitModal = (email) => {
    setUnitData((prevState) => ({
      ...prevState,
      email,
    }));
    setUnitModalOpen(true);
  };

  const closeUnitModal = () => {
    setUnitData({
      email: "",
      amount: "",
    });
    setError("");
    setUnitModalOpen(false);
  };

  const handleUnitChange = ({ currentTarget: input }) => {
    const selectedAmount = parseInt(input.value);
    setUnitData({ ...unitData, [input.name]: selectedAmount });
  };

  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    setError("");

    let dataToSend = { ...unitData, amount: Number(unitData.amount) };

    try {
      setIsLoading(true);
      if (hasAdminRole) {
        const url = "/newunit";
        const { data: res } = await axiosPrivate.post(url, dataToSend);
      }
      if (hasEntRole) {
        const newData = {
          email: authEmail,
          user: { ...dataToSend },
        };

        const url = "/updateunit";
        const { data: res } = await axiosPrivate.post(url, newData);
      }

      setIsLoading(false);
      alert(`${dataToSend.amount} unit added`);
      closeUnitModal();
      await fetchUserData();
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const rawColumns = [
    {
      Header: "First Name",
      accessor: "firstName",
    },
    {
      Header: "Last Name",
      accessor: "lastName",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Roles",
      accessor: "selectedRole",
      Cell: ({ row }) => {
        const user = row.original;
        return (
          <select
            value={user.selectedRole}
            onChange={(event) => handleRoleChange(event, row.index)}
          >
            <option value="User">User</option>
            <option value="Administrator">Administrator</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        );
      },
    },
    {
      Header: "AU",
      accessor: "au",
    },
    {
      Header: "UU",
      accessor: "uu",
    },
    {
      Header: "Action",
      Cell: ({ row }) => {
        const user = row.original;
        return (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <BsFillLockFill
              onClick={() => openPwdModal(user.email)}
              style={{
                display: "inline-block",
                marginRight: "5px",
              }}
            />
            <FaPlusSquare
              onClick={() => openUnitModal(user.email)}
              style={{
                display: "inline-block",
                marginRight: "5px",
              }}
            />
          </div>
        );
      },
    },
    {
      Header: "Enterprise ID",
      accessor: "entID",
    },
    ,
    {
      Header: "User Status",
      accessor: "enabled",
      id: "enabled", // add this line to uniquely identify this column
      Cell: ({ row: { original }, value }) => (
        <label>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleUserStatusChange(e, original.email)}
          />{" "}
          Enabled
        </label>
      ),
    },
    {
      Header: "Verified",
      accessor: "verified",
      Cell: ({ value }) => (
        <span style={{ color: value ? "green" : "red" }}>
          {value ? "User email verified" : "User email not verified"}
        </span>
      ),
    },
  ];

  const columns = React.useMemo(() => {
    if (hasEntRole) {
      // If hasEntRole is true, remove the column with Header 'Roles'
      return rawColumns.filter((column) => column.Header !== "Roles");
    }
    // If hasEntRole is false, return the columns as is
    return rawColumns;
  }, [hasEntRole]);

  const handleUserStatusChange = async (e, email) => {
    const enable = e.target.checked;

    try {
      await axiosPrivate.put("/updateenable", {
        email: email,
        enabled: enable,
      });

      // assuming you have a function to refresh user data after status update
      fetchUserData();
    } catch (error) {
      console.error("Failed to update user status:", error.message);
    }
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, globalFilter },
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data: userData,
    },
    useGlobalFilter,
    usePagination
  );

  useEffect(() => {
    let logoutTimer;

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        handleLogout();
      }, 15 * 60 * 1000); // 15 minutes in milliseconds
    };

    const handleUserActivity = () => {
      resetTimer();
    };

    const handleWindowClose = () => {
      handleLogout();
    };

    // Attach event listeners for user activity and window close
    document.addEventListener("mousemove", handleUserActivity);
    document.addEventListener("keydown", handleUserActivity);
    window.addEventListener("beforeunload", handleWindowClose);

    // Start the initial timer
    resetTimer();

    // Clean up event listeners on component unmount
    return () => {
      clearTimeout(logoutTimer);
      document.removeEventListener("mousemove", handleUserActivity);
      document.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  }, []);

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center mt-4">
                      <img className="logo w-auto" src="logo.png" alt="" />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <NavLink
                                  to={item.to}
                                  className={classNames(
                                    item.current
                                      ? "bg-gray-50 text-green-600"
                                      : "text-gray-700 hover:text-green-600 hover:bg-gray-50",
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                  )}
                                >
                                  <item.icon
                                    className={classNames(
                                      item.current
                                        ? "text-green-600"
                                        : "text-gray-400 group-hover:text-green-600",
                                      "h-6 w-6 shrink-0"
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center mt-4">
              <img className="logo w-auto" src="logo.png" alt="" />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <NavLink
                          to={item.to}
                          className={classNames(
                            item.current
                              ? "bg-gray-50 text-green-600"
                              : "text-gray-700 hover:text-green-600 hover:bg-gray-50",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.current
                                ? "text-green-600"
                                : "text-gray-400 group-hover:text-green-600",
                              "h-6 w-6 shrink-0"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-8">
            <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Separator */}
              <div
                className="h-6 w-px bg-gray-200 lg:hidden"
                aria-hidden="true"
              />

              <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 border-b-2 border-green-400">
                <form className="relative flex flex-1" action="#" method="GET">
                  <label htmlFor="search-field" className="sr-only">
                    Search
                  </label>
                  <MagnifyingGlassIcon
                    className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-green-400"
                    aria-hidden="true"
                  />
                  <input
                    id="search-field"
                    className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                    placeholder="Search..."
                    type="search"
                    name="search"
                  />
                </form>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5 text-green-400 hover:text-green-500"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  {/* Separator */}
                  <div
                    className="hidden lg:block lg:h-6 lg:w-px lg:bg-green-200"
                    aria-hidden="true"
                  />

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative">
                    <Menu.Button className="-m-1.5 flex items-center p-1.5">
                      <span className="sr-only">Open user menu</span>
                      <UserCircleIcon
                        className="h-8 w-8 rounded-full text-green-400"
                        aria-hidden="true"
                      />
                      <span className="hidden lg:flex lg:items-center">
                        <span
                          className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                          aria-hidden="true"
                        >
                          {auth.result.firstName} {auth.result.lastName}
                        </span>
                        <ChevronDownIcon
                          className="ml-2 h-5 w-5 text-green-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <NavLink
                              to="/password"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Your Password
                            </NavLink>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <a
                              onClick={handleLogout}
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Logout
                            </a>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </div>

          <main className="py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="bg-white shadow border-b-2 border-green-400">
                <div className="px-4 sm:px-6 lg:mx-auto lg:max-w-6xl lg:px-8">
                  <div className="py-6 md:flex md:items-center md:justify-between lg:border-t lg:border-green-400">
                    <div className="min-w-0 flex-1">
                      {/* Profile */}
                      <div className="flex items-center">
                        <UserCircleIcon
                          className="hidden h-16 w-16 rounded-full sm:block"
                          aria-hidden="true"
                        />
                        <div>
                          <div className="flex items-center">
                            <UserCircleIcon
                              className="hidden h-16 w-16 rounded-full sm:hidden"
                              aria-hidden="true"
                            />
                            <h1 className="ml-3 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:leading-9">
                              <Greeting />, {auth.result.firstName}{" "}
                              {auth.result.lastName}
                            </h1>
                          </div>
                          <dl className="mt-6 flex flex-col sm:ml-3 sm:mt-1 sm:flex-row sm:flex-wrap">
                            <dt className="sr-only">Account status</dt>
                            <dd className="mt-3 flex items-center text-sm font-medium capitalize text-green-500 sm:mr-6 sm:mt-0">
                              <CheckCircleIcon
                                className="mr-1.5 h-5 w-5 flex-shrink-0 text-green-400"
                                aria-hidden="true"
                              />
                              Verified account
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex space-x-3 md:ml-4 md:mt-0">
                      <NavLink
                        to="/verify"
                        className="inline-flex items-center rounded-md bg-green-100 px-3 py-2 text-sm font-semibold text-green-700 shadow-sm ring-1 ring-inset ring-green-300 hover:bg-green-200"
                      >
                        Verify
                      </NavLink>

                      {(typeof auth.result.entID === "undefined" &&
                        hasAdminRole) ||
                      (typeof auth.result.entID === "undefined" &&
                        hasUserRole) ||
                      (typeof auth.result.entID !== "undefined" &&
                        hasEntRole) ||
                      (typeof auth.result.entID !== "undefined" &&
                        hasAdminRole) ? (
                        <NavLink
                          to="/units"
                          className="inline-flex items-center rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
                        >
                          Get Unit
                        </NavLink>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                  <h2 className="text-3xl font-bold leading-8 text-gray-900 pb-5">
                    User Information
                  </h2>
                  <div className="overflow-x-auto">
                    {loading ? (
                      <p>Loading...</p>
                    ) : (
                      <div className="table-container">
                        <GlobalFilter
                          preGlobalFilteredRows={preGlobalFilteredRows}
                          globalFilter={globalFilter}
                          setGlobalFilter={setGlobalFilter}
                        />
                        <table
                          {...getTableProps()}
                          style={{ width: "100%" }}
                          cellPadding={10}
                        >
                          <colgroup>
                            <col style={{ width: "10%" }} />
                            <col style={{ width: "10%" }} />
                            <col style={{ width: "15%" }} />
                            <col style={{ width: "15%" }} />
                            <col style={{ width: "5%" }} />
                            <col style={{ width: "5%" }} />
                            <col style={{ width: "5%" }} />
                            <col style={{ width: "5%" }} />
                            <col style={{ width: "20%" }} />
                          </colgroup>
                          <thead>
                            {headerGroups.map((headerGroup) => (
                              <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map((column) => (
                                  <th {...column.getHeaderProps()}>
                                    {column.render("Header")}
                                  </th>
                                ))}
                              </tr>
                            ))}
                          </thead>
                          <tbody {...getTableBodyProps()}>
                            {page.map((row) => {
                              prepareRow(row);
                              return (
                                <tr {...row.getRowProps()}>
                                  {row.cells.map((cell) => (
                                    <td {...cell.getCellProps()}>
                                      {cell.render("Cell")}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div>
                          <button
                            onClick={() => gotoPage(0)}
                            disabled={!canPreviousPage}
                          >
                            {"<<"}
                          </button>{" "}
                          <button
                            onClick={() => previousPage()}
                            disabled={!canPreviousPage}
                          >
                            {"<"}
                          </button>{" "}
                          <button
                            onClick={() => nextPage()}
                            disabled={!canNextPage}
                          >
                            {">"}
                          </button>{" "}
                          <button
                            onClick={() => gotoPage(pageCount - 1)}
                            disabled={!canNextPage}
                          >
                            {">>"}
                          </button>{" "}
                          <span>
                            Page{" "}
                            <strong>
                              {pageIndex + 1} of {pageOptions.length}
                            </strong>{" "}
                          </span>
                          <span>
                            | Go to page:{" "}
                            <input
                              type="number"
                              defaultValue={pageIndex + 1}
                              onChange={(e) => {
                                const page = e.target.value
                                  ? Number(e.target.value) - 1
                                  : 0;
                                gotoPage(page);
                              }}
                              style={{ width: "100px" }}
                            />
                          </span>{" "}
                          <select
                            value={pageSize}
                            onChange={(e) => {
                              setPageSize(Number(e.target.value));
                            }}
                          >
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                              <option key={pageSize} value={pageSize}>
                                Show {pageSize}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Modal
                isOpen={confirmationOpen}
                onRequestClose={closeModal}
                className="ModalContainer"
                overlayClassName="ModalOverlay"
              >
                <div className="ModalContent">
                  <h2 className="ModalTitle">Confirmation</h2>
                  <p className="ModalText">
                    Are you sure you want to update the role to{" "}
                    {confirmationData.selectedRole}?
                  </p>
                  <div className="ModalButtonContainer">
                    <button
                      className="ModalButton Primary"
                      onClick={confirmUpdateRoles}
                      disabled={isLoading}
                    >
                      {isLoading ? "Updating..." : "Confirm"}
                    </button>
                    <button
                      className="ModalButton Secondary"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Modal>
              <Modal
                isOpen={pwdModalOpen}
                onRequestClose={closePwdModal}
                className="ModalContainer"
                overlayClassName="ModalOverlay"
              >
                <div className="PasswordModalContent">
                  <h2 className="ModalTitle">Change Password</h2>

                  <form onSubmit={handlePasswordChange}>
                    <input
                      type="password"
                      name="password"
                      placeholder="New password"
                      value={passwordData.password}
                      onChange={handlePasswordInputChange}
                      className="ModalInput"
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className="ModalInput"
                    />
                    <p className={`ModalText ${passwordError ? "Error" : ""}`}>
                      {passwordError}
                    </p>

                    <div className="ModalButtonContainer">
                      <button
                        type="submit"
                        className="ModalButton Primary"
                        disabled={isLoading}
                      >
                        {isLoading ? "Changing..." : "Change Password"}
                      </button>
                      <button
                        className="ModalButton Secondary"
                        onClick={closePwdModal}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </Modal>
              <Modal
                isOpen={unitModalOpen}
                onRequestClose={closeUnitModal}
                className="ModalContainer"
                overlayClassName="ModalOverlay"
              >
                <div className="UnitModalContent">
                  <h2 className="ModalTitle">Add Unit</h2>

                  <form onSubmit={handleUnitSubmit}>
                    <select
                      name="amount"
                      value={unitData.amount}
                      onChange={handleUnitChange}
                      className="ModalInput"
                    >
                      {unitOptions.map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <p className={`ModalText ${error ? "Error" : ""}`}>
                      {error}
                    </p>

                    <div className="ModalButtonContainer">
                      <button
                        type="submit"
                        className="ModalButton Primary"
                        disabled={isLoading}
                      >
                        {isLoading ? "Adding..." : "Add Unit"}
                      </button>
                      <button
                        className="ModalButton Secondary"
                        onClick={closeUnitModal}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </Modal>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
