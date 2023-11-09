import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { Link, useNavigate, useLocation, NavLink } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import {
  LockClosedIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import axios from "../api/axios";
import styles from "./styles.module.css";

const LOGIN_URL = "/auth";

const navigation = [
  { name: "Home", href: "/login" },
  { name: "Pricing", href: "/login#pricing" },
  { name: "Verify Now", href: "/login#verify-now" },
  { name: "Sign Up", href: "/register" },
  { name: "Contact Us", href: "/register#contact" },
];
const userRole = {
  Admin: 5150,
  Ent: 1984,
  User: 2001,
  Disable: 1001,
  Permit: 3600,
};

const Register = () => {
  const { setAuth, auth, navigate } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const entID = Math.floor(Math.random() * 1000) + 1;

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

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roles: {
      Ent: 1984,
    },
    entName: "",
    entID: entID,
  });

  const [cpass, setCpass] = useState({
    confirmpassword: "",
  });

  const handleConfirm = (event) => {
    setCpass({ [event.target.name]: event.target.value });

    //console.log(cpass.confirmpassword);
  };

  const handleChange = (event) => {
    setData({ ...data, [event.target.name]: event.target.value });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isUser, setIsuser] = useState("User");

  const userOptions = [
    { label: "User", value: "User" },
    { label: "Enterprise", value: "Enterprise" },
  ];
  const [currentYear, setCurrentYear] = useState("");

  useEffect(() => {
    const year = new Date().getFullYear();
    setCurrentYear(year.toString());
  }, []);
  const [isEnterprise, setIsEnterprise] = useState(false);

  function handleUserChange(event) {
    const selectedValue = event.target.value;
    setIsuser(selectedValue);

    if (selectedValue === "Enterprise") {
      setIsEnterprise(true);
    } else {
      setIsEnterprise(false);
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMsg("");

    if (cpass.confirmpassword !== data.password) {
      setError("Passwords does not match");
    } else {
      let postData = { ...data };

      if (isUser === "User") {
        postData.roles = {
          User: 2001,
        };
        delete postData.entName;
        delete postData.entID;
      }

      try {
        const response = await axios.post("/register", postData);
        //console.log(response);
        if (response) {
          setMsg(response.data.message);

          setData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            roles: {
              Ent: 1984,
            },
            entName: "",
            entID: entID,
          });
          setError("");
        } else {
          setError(response.data.error);
          setMsg("");
        }
      } catch (error) {
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status <= 500
        ) {
          setError(error.response.data.message);
        }
        setMsg("");
      }
    }

    setIsSubmitting(false);
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
                <span className="sr-only">Your Company</span>
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
                to="/login"
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

        <div className="relative isolate pt-7">
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
          <div className="mx-auto max-w-7xl px-6 py-6 sm:py-16 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-20">
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
                  Signup to get started
                </h2>

                <form
                  className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
                  onSubmit={handleSubmit}
                >
                  <div className="px-4 py-6 sm:p-8">
                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="first-name"
                          className="text-gray-700 text-lg font-bold"
                        >
                          Frist Name
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="firstName"
                            onChange={handleChange}
                            value={data.firstName}
                            id="firstname"
                            autoComplete="first-name"
                            placeholder="First Name"
                            required
                            className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
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
                            name="lastName"
                            onChange={handleChange}
                            value={data.lastName}
                            id="lastname"
                            autoComplete="last-name"
                            placeholder="Last Name"
                            required
                            className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="email"
                          className="text-gray-700 text-lg font-bold"
                        >
                          Email address
                        </label>
                        <div className="mt-2">
                          <input
                            type="email"
                            name="email"
                            onChange={handleChange}
                            value={data.email}
                            id="email"
                            autoComplete="email"
                            placeholder="Email"
                            required
                            className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2 ">
                        <label
                          htmlFor="password"
                          className="text-gray-700 text-lg font-bold"
                        >
                          Password
                        </label>
                        <div className="mt-2">
                          <input
                            type="password"
                            name="password"
                            onChange={handleChange}
                            value={data.password}
                            id="password"
                            autoComplete="password"
                            placeholder="Password"
                            required
                            className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2 ">
                        <label
                          htmlFor="password"
                          className="text-gray-700 text-lg font-bold"
                        >
                          Confirm Password
                        </label>
                        <div className="mt-2">
                          <input
                            type="password"
                            name="confirmpassword"
                            onChange={handleConfirm}
                            value={cpass.confirmpassword}
                            id="password"
                            autoComplete="password"
                            placeholder="Confirm Password"
                            required
                            className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3 sm:col-start-1">
                        <label
                          htmlFor="user"
                          className="text-gray-700 text-lg font-bold"
                        >
                          Register As
                        </label>
                        <div className="mt-2">
                          <select
                            name="user"
                            id="user"
                            onChange={handleUserChange}
                            value={isUser}
                            className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                            required
                          >
                            {userOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {isEnterprise && (
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="enterprise-name"
                            className="text-gray-700 text-lg font-bold"
                          >
                            Enterprise Name
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="entName"
                              onChange={handleChange}
                              value={data.entName}
                              id="enterprisename"
                              autoComplete="enterprise-name"
                              placeholder="Enterprise Name"
                              required
                              className="mt-1 h-12 block w-full pl-4 border-2 border-gray-300 rounded-md shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="pt-4">
                      {error && (
                        <div className={"w-full px-2 " + styles.error_msg}>
                          {error}
                        </div>
                      )}
                      {msg && (
                        <div className={"w-full px-2 " + styles.success_msg}>
                          {msg}
                        </div>
                      )}
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="flex w-full justify-center rounded-md bg-green-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Registering..." : "Register"}
                      </button>
                    </div>
                  </div>
                </form>
                <p className="mt-10 text-center text-sm text-gray-500">
                  Already registered?{" "}
                  <NavLink
                    to="/login"
                    className="font-semibold leading-6 text-green-500 hover:text-green-400"
                  >
                    Login here
                  </NavLink>
                </p>
              </div>
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
                  Email: info@idverification.ng
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

export default Register;
