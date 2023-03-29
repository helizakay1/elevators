import Timer from "../timer/Timer";
import Elevator from "../elevator/Elevator";
import styles from "./Col.module.css";
import ElevtorCell from "../cell/ElevatorCell";
import ButtonCell from "../cell/ButtonCell";
import FloorCell from "../cell/FloorCell";
import { NUM_OF_FLOORS } from "../../constants/elevators";
import { COL_TYPE_ENUM } from "../../enums/elevators";

const Col = ({
  type,
  start,
  end,
  elevatorFloor,
  elevatorStatus,
  onButtonClick,
  buttonStatus,
}) => {
  return (
    <div className={styles["col-including-time"]}>
      <Timer start={start} end={end} />
      <div className={styles.col}>
        {[...Array(NUM_OF_FLOORS).keys()].map((floor) => {
          switch (type) {
            case COL_TYPE_ENUM.FLOOR:
              return <FloorCell floor={floor} key={floor} />;
            case COL_TYPE_ENUM.ELEVATOR:
              return <ElevtorCell key={floor} />;
            case COL_TYPE_ENUM.BUTTON:
              return (
                <ButtonCell
                  key={floor}
                  status={buttonStatus[floor]}
                  floor={floor}
                  onButtonClick={onButtonClick}
                />
              );
            default:
              return null;
          }
        })}
        {type === COL_TYPE_ENUM.ELEVATOR && (
          <Elevator floor={elevatorFloor} status={elevatorStatus} />
        )}
      </div>
    </div>
  );
};

export default Col;
