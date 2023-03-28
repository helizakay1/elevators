import { useState } from "react";
import { useInterval } from "usehooks-ts";
import Button from "../button/Button";
import styles from "./Table.module.css";
import ElevatorIconSVG from "../elevatorIconSVG/ElevatorIconSVG";

const elevatorSound = new Audio("/elevator.mp3");

function Table() {
  const FLOORS = [
    "Ground Floor",
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
    "9th",
  ];
  const TIME_PER_FLOOR = 1000;
  const DELAY_AFTER_ARRIVE = 2000;
  const HANDLE_QUEUE_INTERVAL = 100;

  const [elevatorLocations, setElevatorLocations] = useState([0, 0, 0, 0, 0]);
  const [elevatorStatus, setElevatorStatus] = useState([0, 0, 0, 0, 0]);
  const [buttonStatus, setButtonStatus] = useState([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const [queue, setQueue] = useState([]);
  const [elevatorTime, setElevatorTime] = useState([
    { start: 0, end: 0 },
    { start: 0, end: 0 },
    { start: 0, end: 0 },
    { start: 0, end: 0 },
    { start: 0, end: 0 },
  ]);

  const arrivedElevator = (elevator, targetFloor) => {
    const releaseElevator = (elevator, targetFloor) => {
      setTimeout(() => {
        setState({
          setterFunction: setElevatorStatus,
          index: elevator,
          newValue: 0,
        });
        setState({
          setterFunction: setButtonStatus,
          index: targetFloor,
          newValue: 0,
        });
      }, DELAY_AFTER_ARRIVE);
    };
    elevatorSound.play();
    setState({
      setterFunction: setButtonStatus,
      index: targetFloor,
      newValue: 2,
    });
    setState({
      setterFunction: setElevatorStatus,
      index: elevator,
      newValue: 2,
    });
    releaseElevator(elevator, targetFloor);
  };

  const findElevator = (floorNeedsElevator) => {
    let minDist = Number.MAX_SAFE_INTEGER;
    let chosenElevator = null;
    elevatorLocations.forEach((location, index) => {
      if (
        elevatorStatus[index] === 0 &&
        Math.abs(location - floorNeedsElevator) < minDist
      ) {
        minDist = Math.abs(location - floorNeedsElevator);
        chosenElevator = index;
      }
    });
    return chosenElevator;
  };

  const moveMultipleFloors = ({
    distance,
    change,
    elevator,
    targetFloor,
    i = 0,
  }) => {
    setTimeout(() => {
      moveOneFloor(elevator, change);
      i++;
      if (i < distance) {
        moveMultipleFloors({ distance, change, elevator, targetFloor, i });
      } else {
        setTimeout(() => {
          stopTimer(elevator);
          arrivedElevator(elevator, targetFloor);
        }, TIME_PER_FLOOR);
      }
    }, TIME_PER_FLOOR);
  };

  const bringElevatorToTarget = (elevator, targetFloor) => {
    setState({
      setterFunction: setElevatorStatus,
      index: elevator,
      newValue: 1,
    });
    const currentFloor = elevatorLocations[elevator];
    const change = targetFloor > currentFloor ? 1 : -1;
    const distance = Math.abs(currentFloor - targetFloor);
    startTimer(elevator);
    moveMultipleFloors({ distance, change, elevator, targetFloor });
  };

  const handleElevatorQueue = () => {
    if (queue.length > 0) {
      const floorNeedsElevator = queue[0];
      const chosenElevator = findElevator(floorNeedsElevator);

      if (chosenElevator !== null) {
        bringElevatorToTarget(chosenElevator, floorNeedsElevator);
        setQueue(queue.filter((floor, index) => index !== 0));
      }
    }
  };

  useInterval(handleElevatorQueue, HANDLE_QUEUE_INTERVAL);

  const isElevatorOnFloor = (floor) => {
    for (let i = 0; i < 5; i++) {
      if (elevatorLocations[i] === floor && elevatorStatus[i] === 0) {
        return i;
      }
    }
    return null;
  };

  const moveOneFloor = (elevator, change) => {
    setElevatorLocations((prevLocations) => {
      return prevLocations.map((location, index) => {
        if (index === elevator) {
          return prevLocations[elevator] + change;
        }
        return location;
      });
    });
  };

  const onButtonClick = (floor) => {
    if (buttonStatus[floor] !== 0) {
      return;
    }
    const elevator = isElevatorOnFloor(floor);
    if (elevator !== null) {
      arrivedElevator(elevator, floor);
    } else {
      orderElivator(floor);
    }
  };

  const orderElivator = (floor) => {
    setState({
      setterFunction: setButtonStatus,
      index: floor,
      newValue: 1,
    });
    setQueue([...queue, floor]);
  };

  const setState = ({ setterFunction, index, newValue }) => {
    setterFunction((prevStatus) => {
      return prevStatus.map((status, currentIndex) => {
        return index === currentIndex ? newValue : status;
      });
    });
  };

  const startTimer = (elevator) => {
    const start = Date.now();
    setElevatorTime((prevTime) => {
      return prevTime.map((time, index) => {
        return index === elevator ? { ...time, start } : time;
      });
    });
  };

  const stopTimer = (elevator) => {
    const end = Date.now();
    setElevatorTime((prevTime) => {
      return prevTime.map((time, index) => {
        return index === elevator ? { ...time, end } : time;
      });
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles["col-including-time"]}>
        <p>-</p>
        <div className={styles.col}>
          {[...Array(10).keys()].map((floor) => {
            return (
              <div key={floor} className={styles.cell}>
                <h4>{FLOORS[floor]}</h4>
              </div>
            );
          })}
        </div>
      </div>
      {[...Array(5).keys()].map((elevator, index) => {
        return (
          <div className={styles["col-including-time"]} key={index}>
            <p>
              {elevatorTime[elevator].end - elevatorTime[elevator].start > 0
                ? `${
                    (elevatorTime[elevator].end -
                      elevatorTime[elevator].start) /
                    1000
                  }s`
                : "-"}
            </p>
            <div key={index} className={styles.col}>
              {[...Array(10).keys()].map((floor) => {
                return (
                  <div
                    key={floor}
                    className={`${styles.cell} ${styles["data-cell"]}`}
                  ></div>
                );
              })}
              <ElevatorIconSVG
                floor={elevatorLocations[elevator]}
                status={elevatorStatus[elevator]}
              />
            </div>
          </div>
        );
      })}
      <div className={styles.col}>
        <div className={styles["col-including-time"]}>
          <p>-</p>
          {[...Array(10).keys()].map((floor) => {
            return (
              <div key={floor} className={styles.cell}>
                <Button
                  status={buttonStatus[floor]}
                  onClick={() => onButtonClick(floor)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Table;
