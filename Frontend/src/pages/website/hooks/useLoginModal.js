import { useState } from "react";

export default function useLoginModal() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  return {
    isLoginOpen,
    openLogin,
    closeLogin,
  };
}
