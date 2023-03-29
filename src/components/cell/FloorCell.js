import styles from "./Cell.module.css";
import { FLOORS } from "../../constants/elevators";

const FloorCell = ({ floor }) => {
  return (
    <div className={styles.cell}>
      <h4>{floor < FLOORS.length ? FLOORS[floor] : `${floor}th`}</h4>
    </div>
  );
};

export default FloorCell;
