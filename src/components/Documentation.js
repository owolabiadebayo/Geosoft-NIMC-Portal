import { Fragment, useRef, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { NavLink } from "react-router-dom";
import React, { useEffect } from "react";
import { Tab } from "@headlessui/react";
import "./customTable.css";
import {
  Bars3Icon,
  BellIcon,
  Cog6ToothIcon,
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

const teams = [
  { name: "Change Password", to: "/password", icon: LockClosedIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Documentation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const cancelButtonRef = useRef(null);

  const { setAuth, auth, navigate } = useAuth();
  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("newauth");
  };
  const roles = auth?.roles;
  const hasAdminRole = roles.includes(5150);
  const hasEntRole = roles.includes(1984);
  const hasUserRole = roles.includes(2001);

  const rawNavigation = [
    { name: "Home", to: "/", icon: HomeIcon, current: false },
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
      current: true,
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
              <>
                <div className="mt-8">
                  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold leading-8 text-gray-900 pb-5">
                      API Documentation
                    </h2>
                    <div className="mx-auto mt-16 w-full max-w-2xl lg:col-span-4 lg:mt-0 lg:max-w-none">
                      <Tab.Group as="div">
                        <div className="border-b border-gray-200">
                          <Tab.List className="-mb-px flex space-x-8">
                            <Tab
                              className={({ selected }) =>
                                classNames(
                                  selected
                                    ? "border-green-600 text-green-600"
                                    : "border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-800",
                                  "whitespace-nowrap border-b-2 py-6 text-sm font-medium"
                                )
                              }
                            >
                              Verification API
                            </Tab>

                            <Tab
                              className={({ selected }) =>
                                classNames(
                                  selected
                                    ? "border-green-600 text-green-600"
                                    : "border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-800",
                                  "whitespace-nowrap border-b-2 py-6 text-sm font-medium"
                                )
                              }
                            >
                              API Key
                            </Tab>
                          </Tab.List>
                        </div>
                        <Tab.Panels as={Fragment}>
                          <Tab.Panel className="pt-10">
                            <h3 className="sr-only">Verification API</h3>

                            <div>
                              <h2 className="text-gray-700 text-lg font-bold">
                                1. Verification Call
                              </h2>
                              <p className="pb-5">
                                The below show how to make a verification
                                request call
                              </p>
                              <pre>
                                <code className="http">
                                  {`POST /api/verification HTTP/1.1
Host: ${process.env.REACT_APP_API_HOST}
Content-Type: application/json

{
  "token": "d43bf438ccbfd5a6c4fbfaa4be58bf6bac64f0d",
  "verify": {
    "email": "user@example.com",
    "firstname": "Jude",
    "lastname": "Okoye",
    "phone": "08131111111",
    "idno": "AL449286564755TY",
    "idtype": "VNIN",
    "reference": "BC534527756685UZZ"
  }
}`}
                                </code>
                              </pre>
                              <div className="table-container py-5 ">
                                <table className="custom-table">
                                  <thead>
                                    <tr>
                                      <th>Property</th>
                                      <th>Type</th>
                                      <th>Description</th>
                                      <th>Required</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td>token</td>
                                      <td>string</td>
                                      <td>
                                        Authentication token for the
                                        verification process, this can be found
                                        in the API Key tab
                                      </td>
                                      <td>Yes</td>
                                    </tr>
                                    <tr>
                                      <td>verify.email</td>
                                      <td>email</td>
                                      <td>
                                        Email address of the verifying user.
                                        This can be found in the API Key tab
                                      </td>
                                      <td>Yes</td>
                                    </tr>
                                    <tr>
                                      <td>verify.firstname</td>
                                      <td>string</td>
                                      <td>
                                        First name of the user to be verified.
                                      </td>
                                      <td>Yes</td>
                                    </tr>
                                    <tr>
                                      <td>verify.lastname</td>
                                      <td>string</td>
                                      <td>
                                        Last name of the user to be verified.
                                      </td>
                                      <td>Yes</td>
                                    </tr>
                                    <tr>
                                      <td>verify.phone</td>
                                      <td>string</td>
                                      <td>
                                        Phone number of the user to be verified.
                                      </td>
                                      <td>Yes</td>
                                    </tr>
                                    <tr>
                                      <td>verify.idno</td>
                                      <td>string</td>
                                      <td>
                                        Identification number to be verified
                                        (i.e., NIN, VNIN).
                                      </td>
                                      <td>Yes</td>
                                    </tr>
                                    <tr>
                                      <td>verify.idtype</td>
                                      <td>string</td>
                                      <td>Verification Type.</td>
                                      <td>Yes</td>
                                    </tr>
                                    <tr>
                                      <td>verify.reference</td>
                                      <td>string</td>
                                      <td>
                                        Reference number for the verification
                                        process. (This can be generated in your
                                        code)
                                      </td>
                                      <td>Yes</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <h2>
                                <strong>Result Output:</strong>
                              </h2>
                              <pre>
                                <code className="json">
                                  {`{
  "message": {
    "firstName": "Jude",
    "surname": "Okoye",
    "middleName": "Paul",
    "dateOfBirth": "02 MAY 1983",
    "gender": "M",
    "trustedNumber": "2348137988332",
    "txid": "ce25d456-2fbc-4e2b-8155",
    "ts": "2023-06-07 15:36:02",
    "vNIN": "AL449286564755TY",
    "photograph": "/9j/4AAQSkZJRgA",
    "barcode": "iVBORw0KGgoAAAAN"
  },
  "success": true
}`}
                                </code>
                              </pre>
                              <h2 className="text-gray-700 text-lg font-bold pt-5">
                                2. View Verification for Enterprise
                                Administrators
                              </h2>
                              <p className="pb-5">
                                the below to view verifications done by an
                                enterprise group
                              </p>
                              <pre>
                                <code className="http">
                                  {`POST /api/entverification HTTP/1.1
Host: ${process.env.REACT_APP_API_HOST}
Content-Type: application/json

{
  "email": "user@example.com"",
  "token": "d43bf438ccbfd5"
}`}
                                </code>
                              </pre>
                              <div className="table-container py-5 ">
                                <table className="custom-table">
                                  <thead>
                                    <tr>
                                      <th>Property</th>
                                      <th>Type</th>
                                      <th>Description</th>
                                      <th>Required</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td>token</td>
                                      <td>string</td>
                                      <td>
                                        Authentication token for the
                                        verification process, this can be found
                                        in the API Key tab
                                      </td>
                                      <td>Yes</td>
                                    </tr>
                                    <tr>
                                      <td>email</td>
                                      <td>email</td>
                                      <td>
                                        Email address of the verifying user.
                                        This can be found in the API Key tab
                                      </td>
                                      <td>Yes</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <h2 className="text-gray-700 text-lg font-bold pt-5">
                                3. View Verification for Users
                              </h2>
                              <p className="pb-5">
                                The below to view verifications done by a user
                              </p>
                              <pre>
                                <code className="http">
                                  {`POST /api/userverification HTTP/1.1
Host: ${process.env.REACT_APP_API_HOST}
Content-Type: application/json

{
  "email": "user@example.com"",
  "token": "d43bf438ccbfd5"
}`}
                                </code>
                              </pre>
                              <div className="table-container py-5 ">
                                <table className="custom-table">
                                  <thead>
                                    <tr>
                                      <th>Property</th>
                                      <th>Type</th>
                                      <th>Description</th>
                                      <th>Required</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td>token</td>
                                      <td>string</td>
                                      <td>
                                        Authentication token for the
                                        verification process, this can be found
                                        in the API Key tab
                                      </td>
                                      <td>Yes</td>
                                    </tr>
                                    <tr>
                                      <td>email</td>
                                      <td>email</td>
                                      <td>
                                        Email address of the verifying user.
                                        This can be found in the API Key tab
                                      </td>
                                      <td>Yes</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </Tab.Panel>

                          <Tab.Panel className="pt-10">
                            <h3 className="sr-only">API Key</h3>
                            <div>
                              <h2 className="text-gray-700 text-lg font-bold">
                                Email : {auth.result.email}
                              </h2>
                              <h2 className="text-gray-700 text-lg font-bold">
                                Token : {auth.result.token}
                              </h2>
                            </div>
                          </Tab.Panel>
                        </Tab.Panels>
                      </Tab.Group>
                    </div>
                  </div>
                </div>
              </>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
