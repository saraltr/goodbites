import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} GoodBites • CSE 499 • Senior Project</p>
    </footer>
  );
}
