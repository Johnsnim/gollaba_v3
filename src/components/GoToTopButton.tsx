import React, { useState, useEffect } from "react";
import { TopArrow } from "../asset";

const GoToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            padding: "1rem",
            borderRadius: "50%",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            height: "50px",
            width: "50px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          <img src={TopArrow} alt="toparrow" />
        </button>
      )}
    </>
  );
};

export default GoToTopButton;
