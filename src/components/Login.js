import { useRef, useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { Link, useNavigate, useLocation, NavLink } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import {
  LockClosedIcon,
  Bars3Icon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
//import { ChevronRightIcon } from "@heroicons/react/20/solid";
import axios from "../api/axios";
import styles from "./styles.module.css";
//import PaystackPop from "@paystack/inline-js";
import html2pdf from "html2pdf.js";
// import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";

const LOGIN_URL = "/auth";

const navigation = [
  { name: "Home", href: "/login" },
  { name: "Pricing", href: "/login#pricing" },
  { name: "Verify Now", href: "/login#verify-now" },
  { name: "Sign Up", href: "/register" },
  { name: "Contact Us", href: "/login#contact" },
];

const userRole = {
  Admin: 5150,
  Ent: 1984,
  User: 2001,
  Disable: 1001,
  Permit: 3600,
};

const hobbyFeatures = ["Verification", "Download verification result"];
const scaleFeatures = [
  "Dashboard",
  "Verification",
  "Download verification result",
  "Email verification result",
  "View all verifications",
  "Purchase verification units",
  "View payments transactions",
  "User Management",
  "vNIN API",
];
const growthFeatures = [
  "Dashboard",
  "Verification",
  "Download verification result",
  "Email verification result",
  "View all verifications",
  "Purchase verification units",
  "View payments transactions",
];

const Login = () => {
  const { setAuth, auth, navigate } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState("");
  const [password, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [isMounted, setIsMounted] = useState(true);

  const [data, setData] = useState({
    vemail: "",
    vnin: "",
    firstname: "",
    lastname: "",
    phone: "",
  });

  const [isloading, setIsLoading] = useState(false);
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
  const [dataurl, setDataurl] = useState("");
  const [img, setImg] = useState("");

  const handleformSubmit = () => {
    setFormSubmitted(false);
  };

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setMobileMenuOpen(false);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

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
        formData.append(
          "file",
          dataURItoBlob(dataURL),
          "verificationresult.pdf"
        );
        formData.append("email", data.vemail);

        axios
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

  const [currentYear, setCurrentYear] = useState("");

  useEffect(() => {
    const year = new Date().getFullYear();
    setCurrentYear(year.toString());
  }, []);

  const config = {
    // public_key: process.env.REACT_APP_FLUTTERWAVE_KEY,
    tx_ref: Date.now(),
    amount: process.env.REACT_APP_ONETIME_AMOUT,
    currency: "NGN",
    payment_options: "card,mobilemoney,ussd",
    customer: {
      email: data.vemail,
      phone_number: data.phone,
      name: data.firstname + " " + data.lastname,
    },
    customizations: {
      title: "vNIN Verification",
      description: "Payment for vNIN verification",
      logo: "https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg",
    },
  };

  // const handleFlutterPayment = useFlutterwave(config);

  const newVerification = async (e) => {
    e.preventDefault();
    setErrMsg("");
    try {
      handleFlutterPayment({
        callback: async (response) => {
          //console.log(response);
          if (response.status === "successful") {
            try {
              setIsLoading(true);
              //console.log(data);
              const url = "/guestvnin";
              const { data: res } = await axios.post(url, data);
              setNdata(res.message);
              const uri = `data:image/png;base64,${res.message.barcode}`;
              setDataurl(uri);
              const im = `data:image/png;base64,${res.message.photograph}`;
              setImg(im);
              setData({
                ...data,
                vemail: "",
                vnin: "",
              });

              //console.log(data);
              setFormSubmitted(true);
            } catch (error) {
              if (
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
              ) {
                setErrMsg(error.response.data.message);
              }
            } finally {
              setIsLoading(false); // Set isLoading back to false after response is received
            }
          } else {
            setErrMsg("Failed Transaction");
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
        setErrMsg(error.response.data.message);
      }
    } finally {
      setIsLoading(false); // Set isLoading back to false after response is received
    }
  };

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [user, password]);

  useEffect(() => {
    localStorage.setItem("newauth", JSON.stringify(auth));
    return () => {
      setIsMounted(false);
    };
  }, [auth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const email = user;
      const response = await axios.post(
        LOGIN_URL,
        JSON.stringify({ email, password }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const accessToken = response?.data?.accessToken;
      const roles = response?.data?.roles;
      const enable = response?.data?.result.enabled;

      if (roles.includes(userRole.Permit)) {
        setError(
          `This user needs approval
        Please try again in a few minutes.`
        );
        setLoading(false);
        return; // Return early if the user needs Approval
      }

      const result = response?.data.result;
      //console.log(JSON.stringify(response?.data.result));
      // console.log(JSON.stringify(response));

      setAuth({ user, result, roles, accessToken });
      setUser("");
      setPwd("");
      //console.log(auth.result.firstName);
      setLoading(false);
      navigate("/");
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setLoading(false);
        setError(error.response.data.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  return (
    <>
      <div className="bg-white">
        <header className="absolute inset-x-0 top-0 z-50">
          <nav
            className="flex items-center justify-between p-6 lg:px-8"
            aria-label="Global"
          >
            <div className="flex lg:flex-1">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">IDverification</span>
                <img className="w-auto logo" src="logo.png" alt="" />
              </a>
            </div>
            <div className="flex lg:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="hidden lg:flex lg:gap-x-12">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              <NavLink
                to="/"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Log in <span aria-hidden="true">&rarr;</span>
              </NavLink>
            </div>
          </nav>
          <Dialog
            as="div"
            className="lg:hidden"
            open={mobileMenuOpen}
            onClose={setMobileMenuOpen}
          >
            <div className="fixed inset-0 z-50" />
            <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
              <div className="flex items-center justify-between">
                <a href="#" className="-m-1.5 p-1.5">
                  <span className="sr-only">Your Company</span>
                  <img className="w-auto logo" src="logo.png" alt="" />
                </a>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                  <div className="py-6">
                    <a
                      href="#"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      Log in
                    </a>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Dialog>
        </header>

        <div className="relative isolate pt-14">
          <svg
            className="absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
                width={200}
                height={200}
                x="50%"
                y={-1}
                patternUnits="userSpaceOnUse"
              >
                <path d="M100 200V.5M.5 .5H200" fill="none" />
              </pattern>
            </defs>
            <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
              <path
                d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
                strokeWidth={0}
              />
            </svg>
            <rect
              width="100%"
              height="100%"
              strokeWidth={0}
              fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)"
            />
          </svg>
          <div className="mx-auto max-w-7xl px-6 py-12 sm:py-15 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
              <img
                src="bg.jpg"
                alt="Responsive Image"
                className="mx-auto max-w-full h-auto"
              />
            </div>

            <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
              <div>
                <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900 pb-10">
                  Sign in to your account
                </h2>

                {error && (
                  <div className={"w-full px-2 " + styles.error_msg}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="text-gray-700 text-lg font-bold"
                    >
                      Email address
                    </label>
                    <div className="mt-2">
                      <input
                        name="email"
                        type="email"
                        id="username"
                        ref={userRef}
                        autoComplete="off"
                        onChange={(e) => setUser(e.target.value)}
                        value={user}
                        required
                        className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="text-gray-700 text-lg font-bold"
                    >
                      Password
                    </label>
                    <div className="mt-2">
                      <input
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        id="password"
                        onChange={(e) => setPwd(e.target.value)}
                        value={password}
                        className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-3 block text-sm leading-6 text-gray-700"
                      >
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm leading-6">
                      <NavLink
                        to="/forgotpassword"
                        className="font-semibold text-green-500 hover:text-green-400"
                      >
                        Forgot password?
                      </NavLink>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="flex w-full justify-center rounded-md bg-green-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Log In"}
                    </button>
                  </div>
                </form>
                <p className="mt-10 text-center text-sm text-gray-500">
                  Do not have an account yet?{" "}
                  <NavLink
                    to="/register"
                    className="font-semibold leading-6 text-green-500 hover:text-green-400"
                  >
                    Signup to get started
                  </NavLink>
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900" id="pricing">
            <div className="px-6 pt-12 lg:px-8 lg:pt-20">
              <div className="text-center">
                <h2 className="text-xl font-semibold leading-6 text-gray-300">
                  Pricing
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  The right price for you, whoever you are
                </p>
                <p className="mx-auto mt-3 max-w-4xl text-xl text-gray-300 sm:mt-5 sm:text-2xl">
                  We understand the importance of providing fair and accessible
                  pricing to our diverse range of users. We believe that
                  everyone should have access to reliable identity verification
                  services. Therefore, we offer transparent and flexible pricing
                  options to accommodate your specific needs.
                </p>
              </div>
            </div>

            <div className="mt-16 bg-white pb-12 lg:mt-20 lg:pb-20">
              <div className="relative z-0">
                <div className="absolute inset-0 h-5/6 bg-gray-900 lg:h-2/3" />
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                  <div className="relative lg:grid lg:grid-cols-7">
                    <div className="mx-auto max-w-md lg:col-start-1 lg:col-end-3 lg:row-start-2 lg:row-end-3 lg:mx-0 lg:max-w-none">
                      <div className="flex h-full flex-col overflow-hidden rounded-lg shadow-lg lg:rounded-none lg:rounded-l-lg">
                        <div className="flex flex-1 flex-col">
                          <div className="bg-white px-6 py-10">
                            <div>
                              <h3
                                className="text-center text-2xl font-medium text-gray-900"
                                id="tier-hobby"
                              >
                                One Time
                              </h3>
                              <div className="mt-4 flex items-center justify-center">
                                <span className="flex items-start px-3 text-6xl tracking-tight text-gray-900">
                                  <span className="mr-2 mt-2 text-4xl font-medium tracking-tight">
                                    ₦
                                  </span>
                                  <span className="font-bold">1000</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-1 flex-col justify-between border-t-2 border-gray-100 bg-gray-50 p-6 sm:p-10 lg:p-6 xl:p-10">
                            <ul role="list" className="space-y-4">
                              {hobbyFeatures.map((feature) => (
                                <li key={feature} className="flex items-start">
                                  <div className="flex-shrink-0">
                                    <CheckIcon
                                      className="h-6 w-6 flex-shrink-0 text-green-500"
                                      aria-hidden="true"
                                    />
                                  </div>
                                  <p className="ml-3 text-base font-medium text-gray-500">
                                    {feature}
                                  </p>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-8">
                              <div className="rounded-lg shadow-md">
                                <NavLink
                                  to="/login#verify-now"
                                  className="block w-full rounded-lg border border-transparent bg-white px-6 py-3 text-center text-base font-medium text-green-600 hover:bg-gray-50"
                                  aria-describedby="tier-hobby"
                                >
                                  Start now
                                </NavLink>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mx-auto mt-10 max-w-lg lg:col-start-3 lg:col-end-6 lg:row-start-1 lg:row-end-4 lg:mx-0 lg:mt-0 lg:max-w-none">
                      <div className="relative z-10 rounded-lg shadow-xl">
                        <div
                          className="pointer-events-none absolute inset-0 rounded-lg border-2 border-green-600"
                          aria-hidden="true"
                        />
                        <div className="absolute inset-x-0 top-0 translate-y-px transform">
                          <div className="flex -translate-y-1/2 transform justify-center">
                            <span className="inline-flex rounded-full bg-green-600 px-4 py-1 text-base font-semibold text-white">
                              Most popular
                            </span>
                          </div>
                        </div>
                        <div className="rounded-t-lg bg-white px-6 pb-10 pt-12">
                          <div>
                            <h3
                              className="text-center text-3xl font-semibold tracking-tight text-gray-900 sm:-mx-6"
                              id="tier-growth"
                            >
                              User
                            </h3>
                            <div className="mt-4 flex items-center justify-center">
                              <span className="flex items-start px-3 text-6xl tracking-tight text-gray-900 sm:text-6xl">
                                <span className="mr-2 mt-2 text-4xl font-medium tracking-tight">
                                  ₦
                                </span>
                                <span className="font-bold">750</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-b-lg border-t-2 border-gray-100 bg-gray-50 px-6 pb-8 pt-10 sm:px-10 sm:py-10">
                          <ul role="list" className="space-y-4">
                            {growthFeatures.map((feature) => (
                              <li key={feature} className="flex items-start">
                                <div className="flex-shrink-0">
                                  <CheckIcon
                                    className="h-6 w-6 flex-shrink-0 text-green-500"
                                    aria-hidden="true"
                                  />
                                </div>
                                <p className="ml-3 text-base font-medium text-gray-500">
                                  {feature}
                                </p>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-10">
                            <div className="rounded-lg shadow-md">
                              <NavLink
                                to="/register"
                                className="block w-full rounded-lg border border-transparent bg-green-600 px-6 py-4 text-center text-xl font-medium leading-6 text-white hover:bg-green-700"
                                aria-describedby="tier-growth"
                              >
                                Start now
                              </NavLink>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mx-auto mt-10 max-w-md lg:col-start-6 lg:col-end-8 lg:row-start-2 lg:row-end-3 lg:m-0 lg:max-w-none">
                      <div className="flex h-full flex-col overflow-hidden rounded-lg shadow-lg lg:rounded-none lg:rounded-r-lg">
                        <div className="flex flex-1 flex-col">
                          <div className="bg-white px-6 py-10">
                            <div>
                              <h3
                                className="text-center text-2xl font-medium text-gray-900"
                                id="tier-scale"
                              >
                                Enterprise
                              </h3>
                              <div className="mt-4 flex items-center justify-center">
                                <span className="flex items-start px-3 text-6xl tracking-tight text-gray-900">
                                  <span className="mr-2 mt-2 text-4xl font-medium tracking-tight">
                                    ₦
                                  </span>
                                  <span className="font-bold">800</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-1 flex-col justify-between border-t-2 border-gray-100 bg-gray-50 p-6 sm:p-10 lg:p-6 xl:p-10">
                            <ul role="list" className="space-y-4">
                              {scaleFeatures.map((feature) => (
                                <li key={feature} className="flex items-start">
                                  <div className="flex-shrink-0">
                                    <CheckIcon
                                      className="h-6 w-6 flex-shrink-0 text-green-500"
                                      aria-hidden="true"
                                    />
                                  </div>
                                  <p className="ml-3 text-base font-medium text-gray-500">
                                    {feature}
                                  </p>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-8">
                              <div className="rounded-lg shadow-md">
                                <NavLink
                                  to="/register"
                                  className="block w-full rounded-lg border border-transparent bg-white px-6 py-3 text-center text-base font-medium text-green-600 hover:bg-gray-50"
                                  aria-describedby="tier-scale"
                                >
                                  Start now
                                </NavLink>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="mx-auto max-w-7xl px-6  lg:flex lg:items-center lg:gap-x-10 lg:px-8"
            id="verify-now"
          >
            <div className="mx-auto lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-green-600">
                Verify faster
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                ONE TIME VERIFICATION
              </p>

              <p className="mt-6 text-lg leading-8 text-gray-600">
                Please complete the following form to authenticate a vNIN at
                this time. The instructions for generating a vNIN can be found
                on the right side below.
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-6 py-8 sm:py-16 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-10">
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow mb-10">
              <div>
                <h2 className="mt-2 text-2xl font-bold leading-9 tracking-tight text-gray-900 pb-10">
                  vNIN VERIFICATION
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Provide information about who you want verified
                </p>
                {!formSubmitted ? (
                  <>
                    {errMsg && (
                      <div className={"w-full px-2 " + styles.error_msg}>
                        {errMsg}
                      </div>
                    )}

                    <form onSubmit={newVerification} className="space-y-6">
                      <div>
                        <label
                          htmlFor="first-name"
                          className="text-gray-700 text-lg font-bold"
                        >
                          First Name
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="firstname"
                            value={data.firstname}
                            id="firstname"
                            autoComplete="off"
                            required
                            className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                            onChange={(e) =>
                              setData({ ...data, firstname: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="last-name"
                          className="text-gray-700 text-lg font-bold"
                        >
                          Last Name
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="lastname"
                            value={data.lastname}
                            id="lastname"
                            autoComplete="off"
                            required
                            className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                            onChange={(e) =>
                              setData({ ...data, lastname: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="phone-number"
                          className="text-gray-700 text-lg font-bold"
                        >
                          Phone Number
                        </label>
                        <div className="mt-2">
                          <input
                            type="number"
                            name="phone"
                            id="phone"
                            value={data.phone}
                            autoComplete="off"
                            required
                            className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                            onChange={(e) =>
                              setData({ ...data, phone: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="text-gray-700 text-lg font-bold"
                        >
                          Email address
                        </label>
                        <div className="mt-2">
                          <input
                            name="vemail"
                            type="email"
                            id="vemail"
                            autoComplete="off"
                            required
                            className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                            value={data.vemail}
                            onChange={(e) =>
                              setData({ ...data, vemail: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="vnin"
                          className="text-gray-700 text-lg font-bold"
                        >
                          Enter vNIN
                        </label>
                        <div className="mt-2">
                          <input
                            name="vnin"
                            type="text"
                            autoComplete="off"
                            id="vnin"
                            className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                            value={data.vnin}
                            onChange={(e) =>
                              setData({ ...data, vnin: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="text-green-500">
                        <strong>One verification cost ₦1000</strong>
                      </div>
                      <div>
                        <button
                          type="submit"
                          className="flex w-full justify-center rounded-md bg-green-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
                          disabled={isloading}
                        >
                          {isloading ? "Verifying..." : "Verify"}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="mt-0">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                      <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12">
                        <div></div>

                        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
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
                                    Given Names/Prenoms :<br />{" "}
                                    {ndata.firstName}, {ndata.middleName}
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
                          {/* <button onClick={mailPDF}>Email PDF</button>*/}
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
            </div>
            <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
              {!formSubmitted && (
                <>
                  <div className="pt-0">
                    <h4 className="text-2xl pb-3">Generating a vNIN</h4>
                    <p>There are two ways to generate a virtual NIN:</p>
                  </div>
                  <div className="pt-5 text-2xl flex">
                    <svg width="41" height="40" fill="none">
                      <g
                        stroke="#2C3E50"
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
                    </svg>
                    <h4>Via USSD</h4>
                  </div>
                  <ul className="pt-5">
                    <li className="pl-20 pt-3">
                      To generatea Virtual NIN via USSD, dial <br />
                      <span className="text-green-700">
                        *996*3*Your NIN*119887#
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
                    </svg>
                    <h4>Through the NIMC app</h4>
                  </div>
                  <ul className="pt-5">
                    <li className="pl-20 pt-3">
                      Download the NIMC App - Click on "Get Virtual NIN"
                    </li>
                    <li className="pl-20 pt-3">
                      Select "Input Enterprise short-code" and type 119887
                    </li>
                    <li className="pl-20 pt-3">
                      Click "Submit" and your virtual NIN will be generated.
                    </li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>

        <footer
          className="bg-gray-900"
          aria-labelledby="footer-heading"
          id="contact"
        >
          <h2 id="footer-heading" className="sr-only">
            Footer
          </h2>
          <div className="mx-auto max-w-7xl px-4 pb-2 pt-8 sm:pt-12 lg:px-6 lg:pt-16">
            <div className="xl:grid xl:grid-cols-3 xl:gap-6">
              <div className="space-y-4">
                <p className="text-xs leading-5 text-gray-300">
                  Your Gateway to Secure Identity Verification
                </p>
                <div className="flex items-center mt-2">
                  <LockClosedIcon className="h-4 w-4 text-green-300 mr-1" />
                  <span className="text-xs leading-4 text-green-300">
                    Secure Payment by Flutterwave
                  </span>
                </div>
              </div>
              <div className="mt-8 grid gap-4 xl:mt-0">
                <div className="text-gray-300">
                  <h3 className="text-sm font-semibold text-white">
                    Our Contact
                  </h3>
                  <br />
                  Email: info@geosoftsolutionslimited.com
                  <br />
                  Telephone: +234 803 482 9134
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-white/10 pt-4 sm:mt-10 lg:mt-12">
              <p className="text-xxs leading-4 text-gray-400">
                &copy; {currentYear} {process.env.REACT_APP_COMPANY}, Inc. All
                rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Login;
