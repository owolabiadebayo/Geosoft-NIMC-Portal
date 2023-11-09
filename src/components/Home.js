import { Fragment, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { NavLink } from "react-router-dom";
import React, { useEffect } from "react";
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  UserCircleIcon,
  CheckIcon,
  UserPlusIcon,
  EyeIcon,
  BookOpenIcon,
  LockClosedIcon,
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

const teams = [
  { name: "Change Password", to: "/password", icon: LockClosedIcon },
];
const userNavigation = [
  { name: "Change Password", to: "/password" },
  { name: "Sign out", to: "#" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    setAuth,
    auth,
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
  } = useAuth();
  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("newauth");
  };
  const roles = auth?.roles;
  const hasAdminRole = roles.includes(5150);
  const hasEntRole = roles.includes(1984);
  const hasUserRole = roles.includes(2001);

  const [currentYear, setCurrentYear] = useState("");

  useEffect(() => {
    const year = new Date().getFullYear();
    setCurrentYear(year.toString());
  }, []);

  const rawNavigation = [
    { name: "Home", to: "/", icon: HomeIcon, current: true },
    { name: "Verify", to: "/verify", icon: CheckIcon, current: false },
    { name: "View Verification", to: "/view", icon: EyeIcon, current: false },
    { name: "Units", to: "/units", icon: CreditCardIcon, current: false },
    { name: "Payments", to: "/payment", icon: WalletIcon, current: false },
    { name: "View Users", to: "/users", icon: UsersIcon, current: false },
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
  const email = auth?.user;

  const [isLoading, setIsLoading] = useState(true);

  const summary = async () => {
    const response = await axiosPrivate.get(`/useunit/${email}`, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });

    // Convert the response data to a JSON object
    const result = response.data;
    setAu(result.data.au);
    setUu(result.data.uu);

    const resp = await axiosPrivate.get(`/allverification/${email}`, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });

    // Convert the response data to a JSON object
    const resu = resp.data;
    setcv(resu.count);

    if (hasAdminRole) {
      const respons = await axiosPrivate.get(`/useunit`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
      //console.log(respons.data);

      settAu(respons.data.tau);
      settUu(respons.data.tuu);

      const respo = await axiosPrivate.get(`/userscount`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
      //console.log(respo.data);

      settcu(respo.data.totalUserCount);
    }

    setIsLoading(false);
    // Update the state variables with the fetched data
  };

  useEffect(() => {
    summary();
  }, []);

  useEffect(() => {
    // This code will run whenever the value of 'au' changes
    if (au !== null) {
      all.au = au;
      localStorage.setItem("aau", JSON.stringify(au));
    }
  }, [au]);

  useEffect(() => {
    // This code will run whenever the value of 'au' changes
    if (cv !== null) {
      localStorage.setItem("cv", JSON.stringify(cv));
    }
  }, [cv]);

  useEffect(() => {
    // This code will run whenever the value of 'au' changes
    if (uu !== null) {
      all.uu = uu;
      localStorage.setItem("auu", JSON.stringify(uu));
    }
  }, [uu]);

  useEffect(() => {
    // This code will run whenever the value of 'au' changes
    if (tau !== null) {
      localStorage.setItem("tau", JSON.stringify(tau));
    }
  }, [tau]);

  useEffect(() => {
    // This code will run whenever the value of 'au' changes
    if (tuu !== null) {
      localStorage.setItem("tuu", JSON.stringify(tuu));
    }
  }, [tuu]);

  useEffect(() => {
    // This code will run whenever the value of 'au' changes
    if (tcu !== null) {
      localStorage.setItem("tcu", JSON.stringify(tcu));
    }
  }, [tcu]);

  const cards = [
    {
      name: "Available Unit",
      to: "/units",
      icon: ClipboardDocumentCheckIcon,
      amount: localStorage.getItem("aau"),
    },
    {
      name: "Used Unit",
      to: "/units",
      icon: ClipboardDocumentListIcon,
      amount: localStorage.getItem("auu"),
    },
    {
      name: "Verification Done",
      to: "/view",
      icon: CheckBadgeIcon,
      amount: localStorage.getItem("cv"),
    },
    {
      name: "Total Available Unit",
      to: "/units",
      icon: ClipboardDocumentCheckIcon,
      amount: localStorage.getItem("tau"),
    },
    {
      name: "Total Used Unit",
      to: "/units",
      icon: ClipboardDocumentListIcon,
      amount: localStorage.getItem("tuu"),
    },
    {
      name: "Total Users",
      to: "/users",
      icon: UserGroupIcon,
      amount: localStorage.getItem("tcu"),
    },
    // More items...
  ];

  const filteredCards = cards.filter((card) => {
    if (hasAdminRole) {
      return true; // If the user has the Admin role, show all cards
    } else {
      // If the user does not have the Admin role, only show certain cards
      return ![
        "Total Available Unit",
        "Total Used Unit",
        "Total Users",
      ].includes(card.name);
    }
  });
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
                                      ? "bg-gray-50 text-green-500"
                                      : "text-gray-700 hover:text-green-500 hover:bg-gray-50",
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                  )}
                                >
                                  <item.icon
                                    className={classNames(
                                      item.current
                                        ? "text-green-500"
                                        : "text-gray-400 group-hover:text-green-500",
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
                              ? "bg-gray-50 text-green-500"
                              : "text-gray-700 hover:text-green-500 hover:bg-gray-50",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.current
                                ? "text-green-500"
                                : "text-gray-400 group-hover:text-green-500",
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
                  <h2 className="text-lg font-medium leading-6 text-gray-900">
                    Overview
                  </h2>
                  {isLoading ? (
                    <p>Loading...</p>
                  ) : (
                    <>
                      <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Card */}
                        {filteredCards.map((card) => (
                          <div
                            key={card.name}
                            className="overflow-hidden rounded-lg bg-green-500 text-white shadow"
                          >
                            <div className="p-5">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <card.icon
                                    className="h-6 w-6"
                                    aria-hidden="true"
                                  />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                  <dl>
                                    <dt className="text-white text-lg font-bold">
                                      {card.name}
                                    </dt>
                                    <dd>
                                      <div className="text-lg font-medium text-white">
                                        {card.amount}
                                      </div>
                                    </dd>
                                  </dl>
                                </div>
                              </div>
                            </div>
                            <div className="bg-green-600 px-5 py-3">
                              <div className="text-sm">
                                <NavLink
                                  to={card.to}
                                  className="font-medium text-white hover:text-white"
                                >
                                  View all
                                </NavLink>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
