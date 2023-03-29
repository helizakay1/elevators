import styles from "./Cell.module.css";

const ElevtorCell = () => {
  return <div className={`${styles.cell} ${styles["data-cell"]}`}></div>;
};

export default ElevtorCell;
