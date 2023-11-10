import { Fragment, useRef, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { NavLink } from "react-router-dom";
import React, { useEffect } from "react";
import PaystackPop from "@paystack/inline-js";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import styles from "./styles.module.css";
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
import axios from "axios";
// import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";

const teams = [
  { name: "Change Password", to: "/password", icon: LockClosedIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Stripe publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);

function StripePaymentForm({
  onSubmit,
  axiosPrivate,
  dollarAmount,
  email,
  setError,
  setIsLoading,
  isLoading,
  enabled,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!enabled) {
      setError("Your account needs to be enabled before you can purchase Unit");
    } else {
      if (!stripe || !elements) {
        return;
      }

      try {
        setIsLoading(true);
        const response = await axiosPrivate.post("/create-payment-intent", {
          amount: dollarAmount * 100,
        });

        const { client_secret } = response.data;
        const cardElement = elements.getElement(CardElement);
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

        if (error) {
          throw new Error(error.message);
          setIsLoading(false);
        }

        const result = await stripe.confirmCardPayment(client_secret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              email: email,
            },
          },
        });

        if (result.error) {
          setError(result.error.message);
          setIsLoading(false);
        } else {
          onSubmit(paymentMethod.id);
        }
      } catch (error) {
        setError("[Stripe Error]", error);
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement className="p-4 border border-gray-300 rounded-lg mt-4 mb-4" />

      {isLoading ? ( // Conditionally render loading indicator
        <button
          disabled
          className="h-12 px-6 text-white bg-green-500 rounded-lg hover:bg-green-400 focus:outline-none flex-1 mr-1 w-full"
        >
          Purchasing ...
        </button>
      ) : (
        <button
          type="submit"
          className="h-12 px-6 text-white bg-green-500 rounded-lg hover:bg-green-400 focus:outline-none flex-1 mr-1 w-full"
        >
          Purchase with Stripe
        </button>
      )}
    </form>
  );
}

export default function PurchaseUnit() {
  const formRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [country, setCountry] = useState("");

  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        const response = await axios.get("https://ipapi.co/json/");
        const data = response.data;
        setCountry(data.country_name);
        //console.log(data.country_name);
      } catch (error) {
        console.log("Error fetching user country:", error);
      }
    };

    fetchUserCountry();
  }, []);

  const { setAuth, auth, navigate } = useAuth();
  const enabled = auth.result.enabled;
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
    { name: "Units", to: "/units", icon: CreditCardIcon, current: true },
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  /*const paymentMethodOptions =
    country === "Nigeria"
      ? [{ label: "Paystack", value: "paystack" }]
      : [{ label: "Stripe", value: "stripe" }];*/

  // const paymentMethodOptions = [{ label: "Flutterwave", value: "flutterwave" }];

  const email = auth?.user;
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [isLoading, setIsLoading] = useState(false); // Add isLoading state

  const [totalAmount, setTotalAmount] = useState(0);
  const [dollarAmount, setDollaramount] = useState(0);

  const [data, setData] = useState({
    email: email,
    amount: "",
  });

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

  const handleChange = ({ currentTarget: input }) => {
    const selectedAmount = parseInt(input.value);
    setData({ ...data, [input.name]: selectedAmount });
    setError("");
    if (hasEntRole) {
      setTotalAmount(selectedAmount * process.env.REACT_APP_ENAIRA_AMOUT);
    } else {
      setTotalAmount(selectedAmount * process.env.REACT_APP_UNAIRA_AMOUT);
    }

    setDollaramount(selectedAmount * process.env.REACT_APP_DOLLAR_AMOUT);
  };

  const handlePaymentMethodChange = (e) => {
    setSelectedPaymentMethod(e.target.value);
    setTotalAmount(0);
    setDollaramount(0);
  };

  /* const handleSubmit = async (e) => {
    e.preventDefault();
    // Set isLoading to true when form is submitted
    setError("");

    try {
      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: "",
        amount: totalAmount * 100,
        email: email,
        onSuccess: async (transaction) => {
          try {
            setIsLoading(true);

            const record = {
              ...data,
              totalAmount: totalAmount,
            };

            const recordurl = "/payment";

            const newrecord = await axiosPrivate.post(recordurl, record);

            const url = "/newunit";
            const { data: res } = await axiosPrivate.post(url, data);
            setMsg(res.message);
          } catch (error) {
            if (
              error.response &&
              error.response.status >= 400 &&
              error.response.status <= 500
            ) {
              setError(error.response.data.message);
            }
          } finally {
            setIsLoading(false); // Set isLoading back to false after response is received
          }
        },
        onCancel() {
          alert("You have canceled the transaction");
        },
      });
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    } finally {
      setIsLoading(false); // Set isLoading back to false after response is received
    }
  };*/

  function generateRandomString(length) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  const config = {
    // public_key: process.env.REACT_APP_FLUTTERWAVE_KEY,
    tx_ref: Date.now(),
    amount: totalAmount,
    currency: "NGN",
    payment_options: "card,mobilemoney,ussd",
    customer: {
      email: email,
      phone_number: "08137988332",
      name: auth.result.firstName + " " + auth.result.lastName,
    },
    customizations: {
      title: "vNIN Verification",
      description: "Payment for vNIN verification",
      logo: "https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg",
    },
  };

  // const handleFlutterPayment = useFlutterwave(config);

  const handleSubmitflutterwave = async (e) => {
    e.preventDefault();
    try {
      handleFlutterPayment({
        callback: async (response) => {
          //console.log(response);
          if (response.status === "successful") {
            try {
              setIsLoading(true);

              const reference = "pay_" + generateRandomString(24);

              const totalAmountString = `₦${totalAmount.toString()}`;

              const record = {
                ...data,
                totalAmount: totalAmountString,
                reference: reference,
              };
              const recordurl = "/payment";

              const newrecord = await axiosPrivate.post(recordurl, record);

              const url = "/newunit";
              const { data: res } = await axiosPrivate.post(url, data);
              setMsg(res.message);
              formRef.current.reset();
            } catch (error) {
              if (
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
              ) {
                setError(error.response.data.message);
              }
            } finally {
              setIsLoading(false); // Set isLoading back to false after response is received
            }
          } else {
            setError("Failed Transaction");
          }
          closePaymentModal(); // this will close the modal programmatically
        },
        onClose: () => {
          alert("You have closed the payment form");
        },
      });
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    } finally {
      setIsLoading(false); // Set isLoading back to false after response is received
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setIsLoading(true);
    if (!enabled) {
      setError("Your account needs to be enabled before you can purchase Unit");
    } else {
      if (selectedPaymentMethod === "stripe") {
        // Stripe payment form is already handled separately
        return;
      }

      if (selectedPaymentMethod === "flutterwave") {
        handleSubmitflutterwave(e);
      }
    }

    setIsLoading(false);
  };

  const handleStripeSubmit = async (paymentMethodId) => {
    setError("");
    setMsg("");
    setIsLoading(true);

    try {
      const totalAmountString = `$${dollarAmount.toString()}`;
      const record = {
        ...data,
        totalAmount: totalAmountString,
        reference: paymentMethodId,
      };

      const recordurl = "/payment";
      await axiosPrivate.post(recordurl, record);

      const url = "/newunit";
      const { data: res } = await axiosPrivate.post(url, data);
      setMsg(res.message);
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
                                      ? "bg-gray-50 text-green-400"
                                      : "text-gray-700 hover:text-green-400 hover:bg-gray-50",
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                  )}
                                >
                                  <item.icon
                                    className={classNames(
                                      item.current
                                        ? "text-green-400"
                                        : "text-gray-400 group-hover:text-green-400",
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
                              ? "bg-gray-50 text-green-400"
                              : "text-gray-700 hover:text-green-400 hover:bg-gray-50",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.current
                                ? "text-green-400"
                                : "text-gray-400 group-hover:text-green-400",
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
                      Purchase Unit
                    </h2>
                    <select
                      name="paymentMethod"
                      value={selectedPaymentMethod}
                      onChange={handlePaymentMethodChange}
                      className="p-4 border border-gray-300 rounded-lg mt-4 mb-4 w-full"
                    >
                      <option value="">Choose a payment method</option>
                      {paymentMethodOptions.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>

                    {selectedPaymentMethod === "stripe" && (
                      <div>
                        <label className="block">
                          <span className="text-gray-700 text-lg font-bold">
                            Unit Amount
                          </span>
                          <select
                            name="amount"
                            id="amount"
                            onChange={handleChange}
                            value={data.unit}
                            className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                            required
                          >
                            {unitOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        {dollarAmount > 0 && (
                          <div className="mt-4 text-xl font-bold">
                            Total Amount: ${dollarAmount.toLocaleString()}
                          </div>
                        )}
                        <div>
                          {error && (
                            <div className={"w-full px-2 " + styles.error_msg}>
                              {error}
                            </div>
                          )}
                          {msg && (
                            <div
                              className={"w-full px-2 " + styles.success_msg}
                            >
                              {msg}
                            </div>
                          )}
                        </div>
                        <Elements stripe={stripePromise}>
                          <StripePaymentForm
                            onSubmit={handleStripeSubmit}
                            axiosPrivate={axiosPrivate}
                            dollarAmount={dollarAmount}
                            email={email}
                            setError={setError}
                            setIsLoading={setIsLoading}
                            isLoading={isLoading}
                            enabled={enabled}
                          />
                        </Elements>
                        <div className="text-gray-700 text-lg font-bold mt-4">
                          1 Unit = 1 Verification
                          <p>
                            1 Unit cost ${process.env.REACT_APP_DOLLAR_AMOUT}{" "}
                            per Unit
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedPaymentMethod === "flutterwave" && (
                      <form
                        ref={formRef}
                        className="space-y-6 w-full mt-4"
                        onSubmit={handleSubmit}
                      >
                        <div>
                          <label className="block">
                            <span className="text-gray-700 text-lg font-bold">
                              Unit Amount
                            </span>
                            <select
                              name="amount"
                              id="amount"
                              onChange={handleChange}
                              value={data.unit}
                              className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                              required
                            >
                              {unitOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        {totalAmount > 0 && (
                          <div className="mt-4 text-xl font-bold">
                            Total Amount: &#8358;{totalAmount.toLocaleString()}
                          </div>
                        )}
                        <div>
                          {error && (
                            <div className={"w-full px-2 " + styles.error_msg}>
                              {error}
                            </div>
                          )}
                          {msg && (
                            <div
                              className={"w-full px-2 " + styles.success_msg}
                            >
                              {msg}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center">
                          {isLoading ? ( // Conditionally render loading indicator
                            <button
                              disabled
                              className="h-12 px-6 text-white bg-green-500 rounded-lg hover:bg-green-400 focus:outline-none flex-1 mr-1"
                            >
                              Purchasing ...
                            </button>
                          ) : (
                            <button
                              type="submit"
                              className="h-12 px-6 text-white bg-green-500 rounded-lg hover:bg-green-400 focus:outline-none flex-1 mr-1"
                            >
                              Purchase with flutterwave
                            </button>
                          )}
                        </div>
                        <div className="text-gray-700 text-lg font-bold">
                          1 Unit = 1 Verification
                          {hasEntRole ? ( // Conditionally render loading indicator
                            <p>
                              1 Unit cost &#8358;
                              {process.env.REACT_APP_ENAIRA_AMOUT} per Unit
                            </p>
                          ) : (
                            <p>
                              1 Unit cost &#8358;
                              {process.env.REACT_APP_UNAIRA_AMOUT} per Unit
                            </p>
                          )}
                        </div>
                        <div className="text-gray-700 text-lg font-bold"></div>
                      </form>
                    )}
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
