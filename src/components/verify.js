import { Fragment, useState, useRef } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { NavLink } from "react-router-dom";
import React, { useEffect } from "react";
import {
  Bars3Icon,
  BellIcon,
  Cog6ToothIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  CreditCardIcon,
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
import PaystackPop from "@paystack/inline-js";
import styles from "./styles.module.css";
import html2pdf from "html2pdf.js";
import axios from "axios";

const teams = [
  { name: "Change Password", to: "/password", icon: LockClosedIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Verify() {
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const cancelButtonRef = useRef(null);
  const { setAuth, auth, navigate } = useAuth();
  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("newauth");
  };
  const roles = auth?.roles;
  const enabled = auth.result.enabled;
  const hasAdminRole = roles.includes(5150);
  const hasEntRole = roles.includes(1984);
  const hasUserRole = roles.includes(2001);

  const rawNavigation = [
    { name: "Home", to: "/", icon: HomeIcon, current: false },
    { name: "Verify", to: "/verify", icon: CheckIcon, current: true },
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

  const identityOptions = [
    { label: "Choose one", value: "" },
    { label: "Virtual National Identification Number (vNIN)", value: "vnin" },
  ];

  const mailPDF = () => {
    const element = document.getElementById("my-node");
    let opt = {
      margin: 1,
      filename: "verificationresult.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .output("datauristring")
      .then((dataURL) => {
        let formData = new FormData();
        formData.append("file", dataURItoBlob(dataURL), "myfile.pdf");
        formData.append("email", email);

        axiosPrivate
          .post("/send-email", formData)
          .then((response) => {
            alert("Verification result sent to your email as attachment");
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      });
  };

  function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(",")[1]);
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  const downloadPDF = () => {
    const element = document.getElementById("my-node");

    let opt = {
      margin: 1,
      filename: "verificationresult.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  const [data, setData] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    idno: "",
    idtype: "",
    email: email,
    reference: "",
    preference: "",
  });
  const [dataurl, setDataurl] = useState("");

  const [img, setImg] = useState("");

  const [isLoading, setIsLoading] = useState(false); // Add isLoading state
  const [ndata, setNdata] = useState({
    firstName: "",
    surname: "",
    middleName: "",
    dateOfBirth: "",
    userid: "",
    gender: "",
    trustedNumber: "",
    txid: "",
    ts: "",
    vNIN: "",
    agentID: "",
    photograph: "",
    barcode: "",
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [error, setError] = useState("");

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
    if (input.value === "vnin") {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const handleClick = () => {
    setPaymentStatus("pay");
  };

  const unitClick = () => {
    setPaymentStatus("unit");
  };
  const [isBusy, setIsBusy] = useState(false); // Add isLoading state

  const handleformSubmit = () => {
    setFormSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Set isLoading to true when form is submitted
    setError("");
    if (!enabled) {
      setError("Your account needs to be enabled before you can verify");
    } else {
      const generateRandomString = () => {
        const length = 6; // set the desired length of the string
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; // set the allowed characters for the string
        let result = ""; // initialize an empty string

        // loop through the length and add a random character from the allowed characters to the result string
        for (let i = 0; i < length; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * characters.length)
          );
        }

        // return the result string with the word "unit" appended to the end
        return result + "unit";
      };
      if (data.preference !== "") {
        await axiosPrivate.put("/vadmin", {
          reference: data.preference,
          verified: true,
        });
      }
      if (paymentStatus === "pay") {
        try {
          const paystack = new PaystackPop();

          paystack.newTransaction({
            key: "pk_test_22a51a8148647e14ac7dccda4b605db35b188715",
            amount: 1000 * 100,
            email: email,
            onSuccess: async (transaction) => {
              try {
                setIsLoading(true);
                const url = "/verify";
                data.reference = transaction.reference;
                //console.log(data);
                //console.log(transaction.reference);
                const { data: res } = await axiosPrivate.post(url, data);
                setNdata(res.message);
                const uri = `data:image/png;base64,${res.message.barcode}`;
                setDataurl(uri);
                const im = `data:image/png;base64,${res.message.photograph}`;
                setImg(im);
                setData({
                  firstname: "",
                  lastname: "",
                  phone: "",
                  idno: "",
                  idtype: "",
                  email: email,
                  reference: "",
                  remark: "remark",
                  preference: "",
                });

                //console.log(data);
                setFormSubmitted(true);
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
      }
      if (paymentStatus === "unit") {
        //console.log(paymentStatus);
        try {
          const result = await axiosPrivate.post("/useunit", {
            email: email,
          });
          try {
            setIsBusy(true);
            const randomString = generateRandomString();
            const url = "/verify";
            data.reference = randomString;
            //console.log(data);
            //console.log(transaction.reference);
            const { data: res } = await axiosPrivate.post(url, data);
            setNdata(res.message);
            const uri = `data:image/png;base64,${res.message.barcode}`;
            setDataurl(uri);
            const im = `data:image/png;base64,${res.message.photograph}`;
            setImg(im);
            setData({
              firstname: "",
              lastname: "",
              phone: "",
              idno: "",
              idtype: "",
              email: email,
              reference: "",
              preference: "",
            });

            //console.log(data);
            setFormSubmitted(true);
          } catch (error) {
            if (
              error.response &&
              error.response.status >= 400 &&
              error.response.status <= 500
            ) {
              setError(error.response.data.message);
            }
          } finally {
            setIsBusy(false); // Set isLoading back to false after response is received
          }
        } catch (error) {
          if (
            error.response &&
            error.response.status >= 400 &&
            error.response.status <= 500
          ) {
            setError(error.response.data.message);
          }
        } finally {
          setIsBusy(false); // Set isLoading back to false after response is received
        }
      }
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
        <Transition.Root show={open} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            initialFocus={cancelButtonRef}
            onClose={setOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                      onClick={() => setOpen(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <div className="w-full items-start justify-start flex flex-col px-12 pt-12 pb-6">
                      <h1 className="font-bold text-xl xl:text-2xl pb-2 ">
                        {" "}
                        Verification{" "}
                      </h1>
                      <p className="text-md font-bold text-red-500">NOTICE</p>
                      <p className="text-2xl font-bold pt-5">
                        kindly note that the National Identity Management
                        Commission (NIMC) has stopped the use of actual 11-digit
                        NINs for verifications, in a bid to improve data
                        privacy. Please generate a virtual NIN (vNIN) to
                        continue your NIN verification
                      </p>
                      <div className="pt-5">
                        <h4 className="text-2xl pb-3">Generating a vNIN</h4>
                        <p>There are two ways to generate a virtual NIN:</p>
                      </div>
                      <div className="pt-5 text-2xl flex">
                        <svg width="41" height="40" fill="none">
                          <g
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.75"
                            clipPath="url(#ussdhint_svg__a)"
                          >
                            <path d="M26.666 6.667H13.333c-.92 0-1.667.746-1.667 1.666v23.334c0 .92.747 1.666 1.667 1.666h13.333c.921 0 1.667-.746 1.667-1.666V8.333c0-.92-.746-1.666-1.666-1.666zm-8.332 1.666h3.333m-1.667 20v.017"></path>
                          </g>
                          <path fill="#fff" d="M20 15h21v10H20z"></path>
                          <path
                            fill="#262626"
                            d="M22.29 17.682l-.137 1.305 1.313-.372.102.728-1.227.11.797 1.062-.663.359-.578-1.145-.516 1.142-.69-.356.789-1.063-1.22-.113.116-.724 1.289.372-.137-1.305h.762zM26.511 23h-.806v-3.216c0-.107 0-.214.003-.322l.007-.314c.004-.103.01-.2.017-.294-.048.052-.107.11-.178.17a11.13 11.13 0 01-.219.192l-.574.458-.403-.509 1.483-1.162h.67V23zm5.028 0h-3.384v-.605l1.296-1.313c.25-.255.457-.475.618-.66.162-.186.282-.363.36-.529.079-.166.119-.347.119-.543 0-.242-.07-.424-.209-.547-.139-.126-.322-.188-.55-.188-.216 0-.417.043-.602.13a2.795 2.795 0 00-.567.362l-.44-.53c.138-.118.286-.227.444-.325a2.289 2.289 0 011.203-.321c.316 0 .59.057.82.171a1.237 1.237 0 01.718 1.169c0 .269-.054.517-.16.745-.108.228-.26.454-.459.677-.198.22-.434.461-.707.721l-.865.844v.038h2.365V23zm3.814-3.855c0 .225-.045.421-.136.587a1.158 1.158 0 01-.376.41c-.157.105-.34.18-.547.226v.024c.399.05.7.175.902.376.205.2.308.466.308.796 0 .29-.07.549-.209.776a1.4 1.4 0 01-.639.534c-.287.13-.656.194-1.107.194a4.06 4.06 0 01-.755-.065 2.791 2.791 0 01-.657-.208v-.714a3.24 3.24 0 001.357.328c.417 0 .715-.078.892-.233.178-.157.267-.373.267-.65a.667.667 0 00-.14-.437c-.091-.114-.234-.199-.428-.256a2.66 2.66 0 00-.741-.085h-.441v-.646h.444c.29 0 .522-.035.697-.103a.767.767 0 00.38-.29.774.774 0 00.12-.431c0-.214-.07-.38-.209-.5-.139-.12-.345-.18-.619-.18-.168 0-.322.019-.461.058a2.085 2.085 0 00-.38.147 3.664 3.664 0 00-.331.191l-.386-.557c.189-.141.414-.26.676-.359a2.61 2.61 0 01.916-.147c.513 0 .908.11 1.187.332.278.218.416.512.416.881zm3.883.875l-.191.977h.923v.57h-1.033L38.66 23h-.609l.28-1.432h-.854L37.206 23h-.595l.264-1.432h-.855v-.57h.964l.195-.979h-.906v-.57h1.008l.274-1.443h.608l-.273 1.443h.861l.277-1.443h.591l-.273 1.443h.861v.57h-.97zm-1.65.977h.854l.195-.977h-.858l-.192.977z"
                          ></path>
                          <defs>
                            <clipPath id="ussdhint_svg__a">
                              <path fill="#fff" d="M0 0h40v40H0z"></path>
                            </clipPath>
                          </defs>
                        </svg>{" "}
                        <h4>Via USSD</h4>
                      </div>
                      <ul className="pt-5">
                        <li className="pl-20 pt-3">
                          To generate a Virtual NIN via USSD, dial <br />
                          <span className="text-green-700">
                            *346*3*Your NIN*119887#
                          </span>
                        </li>
                        <li className="pl-20 pt-3">
                          An SMS message will be sent back to you containing the
                          Virtual NIN generated for you.
                        </li>
                      </ul>
                      <div className="pt-5 text-2xl flex">
                        <svg width="40" height="40" fill="none">
                          <g
                            stroke="#2C3E50"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.75"
                            clipPath="url(#apphint_svg__a)"
                          >
                            <path d="M26.666 6.667H13.333c-.92 0-1.667.746-1.667 1.666v23.334c0 .92.747 1.666 1.667 1.666h13.333c.921 0 1.667-.746 1.667-1.666V8.333c0-.92-.746-1.666-1.666-1.666zm-8.332 1.666h3.333m-1.667 20v.017"></path>
                          </g>
                          <defs>
                            <clipPath id="apphint_svg__a">
                              <path fill="#fff" d="M0 0h40v40H0z"></path>
                            </clipPath>
                          </defs>
                        </svg>{" "}
                        <h4>Through the NIMC app</h4>
                      </div>
                      <ul className="pt-5">
                        <li className="pl-20 pt-3">
                          Download the NIMC App- Click on "Get Virtual NIN"
                        </li>
                        <li className="pl-20 pt-3">
                          Select "Input Enterprise short-code" and type 119887
                        </li>
                        <li className="pl-20 pt-3">
                          Click "Submit" and your virtual NIN will be generated.
                        </li>
                      </ul>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
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

              {!formSubmitted ? (
                <>
                  <div className="mt-8">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                      <form
                        className="space-y-6 w-full px-6"
                        onSubmit={handleSubmit}
                      >
                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
                          <div>
                            <h2 className="text-base font-semibold leading-7 text-gray-900">
                              Verification Request
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-gray-600">
                              Provide information about who you want verified
                            </p>
                          </div>

                          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                            <div className="sm:col-span-3">
                              <label
                                htmlFor="first-name"
                                className="text-gray-700 text-lg font-bold"
                              >
                                First name
                              </label>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  name="firstname"
                                  onChange={handleChange}
                                  value={data.firstname}
                                  id="firstname"
                                  autoComplete="given-name"
                                  className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                  placeholder="First Name"
                                  required
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <label
                                htmlFor="last-name"
                                className="text-gray-700 text-lg font-bold"
                              >
                                Last name
                              </label>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  name="lastname"
                                  id="lastname"
                                  onChange={handleChange}
                                  value={data.lastname}
                                  autoComplete="family-name"
                                  className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                  placeholder="Last Name"
                                  required
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <label
                                htmlFor="phone"
                                className="text-gray-700 text-lg font-bold"
                              >
                                Phone number
                              </label>
                              <div className="mt-2">
                                <input
                                  type="number"
                                  name="phone"
                                  id="phone"
                                  onChange={handleChange}
                                  value={data.phone}
                                  autoComplete="phone-number"
                                  className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                  required
                                  placeholder="Phone"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <label
                                htmlFor="idtype"
                                className="text-gray-700 text-lg font-bold"
                              >
                                Identity Type
                              </label>
                              <div className="mt-2">
                                <select
                                  name="idtype"
                                  id="idtype"
                                  onChange={handleChange}
                                  value={data.idtype}
                                  className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                  required
                                >
                                  {identityOptions.map((option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="sm:col-span-4">
                              <label
                                htmlFor="idno"
                                className="text-gray-700 text-lg font-bold"
                              >
                                Identification Number
                              </label>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  name="idno"
                                  id="idno"
                                  onChange={handleChange}
                                  value={data.idno}
                                  autoComplete="identity-no"
                                  className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                  required
                                  placeholder="Identification Number"
                                />
                              </div>
                            </div>
                            <div className="col-span-full">
                              {error && (
                                <div
                                  className={"w-full px-2 " + styles.error_msg}
                                >
                                  {error}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-x-6">
                          {isBusy ? (
                            <button
                              disabled
                              type="button"
                              className="h-12 px-6 text-white bg-green-500 rounded-lg hover:bg-green-400 focus:outline-none flex-1 mr-1"
                            >
                              Verifying ...
                            </button>
                          ) : (
                            <button
                              onClick={unitClick}
                              type="submit"
                              className="h-12 px-6 text-white bg-green-500 rounded-lg hover:bg-green-400 focus:outline-none flex-1 mr-1"
                            >
                              Verify with Unit
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-8">
                  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
                      <div></div>

                      <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                        <div
                          id="my-node"
                          className="md:flex items-start justify-start w-full lg:space-y-0 space-y-4 lg:space-x-4 px-12 flex flex-col"
                        >
                          <div className="bg-white flex flex-col items-center justify-start px-4 w-[600px] h-[350px] shadow-md">
                            <div className="flex items-center justify-center w-full">
                              {/* Front of the card */}
                              <div className="flex items-center justify-center w-24 h-24 mr-4">
                                <img
                                  src="nimc.png"
                                  alt="Logo"
                                  className="w-auto h-auto max-w-24 max-h-24"
                                />
                              </div>
                              <div>
                                <h2 className="text-xl font-bold">
                                  FEDERAL REPUBLIC OF NIGERIA
                                </h2>
                                <p className="text-sm">
                                  Verified at National Identity Management
                                  Commission
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-row items-center w-full">
                              <div className="id-card-photo w-48 h-48 overflow-hidden mx-6">
                                <img
                                  src={img}
                                  alt="Photo"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex flex-col items-start justify-between space-y-2">
                                <p className="text-base font-semibold">
                                  Surname/Nom : <br /> {ndata.surname}
                                </p>
                                <p className="text-base font-semibold">
                                  Given Names/Prenoms :<br /> {ndata.firstName},{" "}
                                  {ndata.middleName}
                                </p>
                                <p className="text-base font-semibold">
                                  Date of Birth : <br /> {ndata.dateOfBirth}
                                </p>
                                <p className="text-base font-semibold">
                                  Gender : {ndata.gender}
                                </p>
                                <p className="text-base font-semibold">
                                  Phone Number : {ndata.trustedNumber}
                                </p>
                              </div>
                              <div className="flex flex-col items-center justify-center ml-6">
                                <img
                                  src={dataurl}
                                  alt="QR Code"
                                  className="w-48 h-48"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Back of the card */}
                          <div className="bg-white flex flex-col items-center justify-start px-4 w-[600px] h-[350px] shadow-md">
                            <div className="flex flex-col items-center justify-center h-full">
                              <p className="text-xl font-bold text-center mb-4">
                                Disclaimer
                              </p>
                              <p className="text-base font-semibold text-center">
                                Trust, but verify.
                              </p>
                              <p className="text-base text-center px-4">
                                While every effort has been made to ensure the
                                accuracy of the verification process, it is
                                important to note that it may not be 100%
                                foolproof. The verification result should be
                                considered as an indication of verification
                                status rather than an absolute guarantee.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div></div>
                      <div className="border-t border-gray-200 w-full my-4 pt-4 flex flex-col justify-center items-center">
                        <button onClick={downloadPDF}>Download PDF</button>
                        <button onClick={mailPDF}>Email PDF</button>
                        <button
                          onClick={handleformSubmit}
                          type="button"
                          className="w-60 h-12 px-6 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none ml-1"
                        >
                          Back to verification
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
