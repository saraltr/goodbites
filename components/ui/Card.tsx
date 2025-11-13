import styles from "./Card.module.css";

interface CardProps {
  title: string;
  image?: string;
  children?: React.ReactNode;
}

export default function Card({ title, image, children }: CardProps) {
  return (
    <div className={styles.card}>
      {image && <img src={image} alt={title} className={styles.image} />}
      <h2 className={styles.title}>{title}</h2>
      {children}
    </div>
  );
}
