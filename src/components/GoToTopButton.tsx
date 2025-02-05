import React, { useState, useEffect } from "react";

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
        transition:
          "opacity 0.5s ease, transform 0.3s ease, box-shadow 0.3s ease",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "9999",
      }}
      onMouseOver={(e) => {
        (e.target as HTMLElement).style.transform = "scale(1.2)";
        (e.target as HTMLElement).style.boxShadow =
          "0 6px 12px rgba(0, 0, 0, 0.4)";
      }}
      onMouseOut={(e) => {
        (e.target as HTMLElement).style.transform = "scale(1)";
        (e.target as HTMLElement).style.boxShadow =
          "0 4px 8px rgba(0, 0, 0, 0.3)";
      }}
    >
      TOP
    </button>
  );
};

export default GoToTopButton;
