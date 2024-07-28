import { Inter } from "next/font/google";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./globals.css";
import "../assets/vendor/css/core.css";
import "../assets/vendor/css/theme-default.css";
import "../assets/css/demo.css";
import "../assets/css/style.css";
import "../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import "../assets/vendor/css/pages/page-auth.css"; 
import 'react-responsive-modal/styles.css';
import "react-datepicker/dist/react-datepicker.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import StoreProvider from "./StoreProvider";
import moment from "moment";


const inter = Inter({ 
  subsets: ["latin"],
  preload: true 
});

export const metadata = {
  title: "Invoscan",
  description: "Invoscan",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="light-style layout-wide customizer-hide"
      dir="ltr">
        <head>
          {/* <link rel="preload" href={preload} as="style" /> */}
          <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'
           as="style"></link>
        </head>
      <body className={inter.className}>
        <StoreProvider>
          {children}
        </StoreProvider>
        <ToastContainer autoClose={2000}/>
        <div id="ajax-loader">
          <img src="/loader.gif" />
        </div>
      </body>
    </html>
  );
}
