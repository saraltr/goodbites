import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import styles from "./LayoutWrapper.module.css";

interface LayoutWrapperProps {
  children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}
