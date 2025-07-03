import React from 'react';
import HeaderV1 from './Header/HeaderV1';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <HeaderV1 />
      <main>{children}</main>
    </>
  );
};

export default Layout; 