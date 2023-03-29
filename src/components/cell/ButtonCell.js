import Button from "../button/Button";
import styles from "./Cell.module.css";

const ButtonCell = ({ status, floor, onButtonClick }) => {
  return (
    <div className={styles.cell}>
      <Button status={status} onClick={() => onButtonClick(floor)} />
    </div>
  );
};

export default ButtonCell;
