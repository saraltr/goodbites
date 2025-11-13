"use client";
import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>GoodBites</div>
      <div className={styles.links}>
        <Link href="/mealplanner" className={styles.link}>Meal Planner</Link>
        <Link href="/recipes" className={styles.link}>Recipes</Link>
        <Link href="/login" className={styles.signin}>Sign In</Link>
      </div>
    </nav>
  );
}
