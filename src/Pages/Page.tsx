// Page principale
// import React from "react";
import Header from "../Layout/Header";
import Hero from "../components/hero/Hero";
import ModelePage from "../components/Modeles/ModelePage";

export function Page() {
  return (
    <div>
      <Header />
      <Hero />
      <ModelePage />
    </div>
  );
}

export default Page;
