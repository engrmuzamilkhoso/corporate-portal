import React from 'react';
import Image from 'next/image';
import loaderImg from "@/public/images/loader.gif";

// @ts-ignore
const Loader = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <Image className="loader" src={loaderImg} alt="Loading" width={80}/>
        <br/>
        <div className="text-center"> Loading...</div>
      </div>
    </div>
  );
};

export default Loader;
