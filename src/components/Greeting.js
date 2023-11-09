import React, { useEffect, useState } from "react";

function Greeting() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const currentTime = new Date().getHours();

    if (currentTime >= 0 && currentTime < 12) {
      setGreeting("Good morning");
    } else if (currentTime >= 12 && currentTime < 17) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  return <span>{greeting}</span>;
}

export default Greeting;
