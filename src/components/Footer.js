import React, { useEffect, useState } from "react";

const Footer = () => {
  const [currentYear, setCurrentYear] = useState("");

  useEffect(() => {
    const year = new Date().getFullYear();
    setCurrentYear(year.toString());
  }, []);

  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-4 pb-2 pt-4 sm:pt-12 lg:px-6 lg:pt-16">
        <div className="xl:grid-cols-4 xl:gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Contact Us</h3>
            <p className="text-xs leading-5 text-gray-300">
              Email: ceochris@yahoo.com, info@kevonneconsults.ng Telephone:
              08118856008, 08147792632
            </p>
          </div>
        </div>
        <div className="mt-2 border-t border-white/10 pt-2 sm:mt-2 lg:mt-2">
          <p className="text-xxs leading-4 text-gray-400">
            &copy; {currentYear} Your Company, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
