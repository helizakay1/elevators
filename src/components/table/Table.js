import { useState } from "react";
import { useInterval } from "usehooks-ts";
import styles from "./Table.module.css";
import Col from "../col/Col";
import {
  NUM_OF_ELEVATORS,
  NUM_OF_FLOORS,
  TIME_PER_FLOOR,
  DELAY_AFTER_ARRIVE,
  HANDLE_QUEUE_INTERVAL,
} from "../../constants/elevators";
import {
  BUTTON_STATUS_ENUM,
  ELEVATOR_STATUS_ENUM,
} from "../../enums/elevators";

function Table() {
  const elevatorSound = new Audio("/elevator.mp3");

  // States

  const [elevatorLocations, setElevatorLocations] = useState(
    [...Array(NUM_OF_ELEVATORS).keys()].map(() => NUM_OF_FLOORS - 1)
  );
  const [elevatorStatus, setElevatorStatus] = useState(
    [...Array(NUM_OF_ELEVATORS).keys()].map(
      () => ELEVATOR_STATUS_ENUM.AVAILABLE
    )
  );
  const [buttonStatus, setButtonStatus] = useState(
    [...Array(NUM_OF_FLOORS).keys()].map(() => BUTTON_STATUS_ENUM.CALL)
  );
  const [queue, setQueue] = useState([]);
  const [elevatorTime, setElevatorTime] = useState(
    [...Array(NUM_OF_ELEVATORS).keys()].map(() => ({
      start: 0,
      end: 0,
    }))
  );

  // Sending elevtor to first floor waiting on queue, if available
  const handleElevatorQueue = () => {
    if (queue.length > 0) {
      const floorNeedsElevator = queue[0];
      const chosenElevator = findElevator(floorNeedsElevator);

      // In case we found available elevator
      if (chosenElevator !== null) {
        bringElevatorToTarget(chosenElevator, floorNeedsElevator);
        // Remove floor from waiting queue
        setQueue(queue.filter((floor, index) => index !== 0));
      }
    }
  };

  // Every HANDLE_QUEUE_INTERVAL miliseconds handles the waiting queue
  useInterval(handleElevatorQueue, HANDLE_QUEUE_INTERVAL);

  const releaseElevator = (elevator, targetFloor) => {
    setTimeout(() => {
      // Change elevator status to available
      setState({
        setterFunction: setElevatorStatus,
        index: elevator,
        newValue: ELEVATOR_STATUS_ENUM.AVAILABLE,
      });

      //Change button status to available
      setState({
        setterFunction: setButtonStatus,
        index: targetFloor,
        newValue: BUTTON_STATUS_ENUM.CALL,
      });
    }, DELAY_AFTER_ARRIVE);
  };

  const arrivedElevator = (elevator, targetFloor) => {
    // Play sonund
    elevatorSound.play();

    // Set button status to "arrived"
    setState({
      setterFunction: setButtonStatus,
      index: targetFloor,
      newValue: BUTTON_STATUS_ENUM.ARRIVED,
    });

    // Set elevator status to "arrived"
    setState({
      setterFunction: setElevatorStatus,
      index: elevator,
      newValue: ELEVATOR_STATUS_ENUM.ARRIVED,
    });

    releaseElevator(elevator, targetFloor);
  };

  const findElevator = (floorNeedsElevator) => {
    // Smallest distance between target floor to elevators
    let minDist = Number.MAX_SAFE_INTEGER;
    let chosenElevator = null;

    // Itetrate all elevators to find closest
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
    // On first iteration don't wait TIME_PER_FLOOR before moving.
    if (distance > 0 && i === 0) {
      moveOneFloor(elevator, change);
      i++;
    }
    // If reached target on first iteration call "arrivedElevator" and stop timer without waiting TIME_PER_FLOOR
    if (i === distance) {
      setTimeout(() => {
        // The elevator still takes another TIME_PER_FLOOR to finish.
        stopTimer(elevator);
        arrivedElevator(elevator, targetFloor);
      }, TIME_PER_FLOOR);
    }
    // Each floor will take TIME_PER_FLOOR milliseconds.
    setTimeout(() => {
      if (i < distance - 1) {
        moveOneFloor(elevator, change);
        i++;
        moveMultipleFloors({ distance, change, elevator, targetFloor, i });
      } else if (i < distance) {
        // 1 step away from target, no need to wait TIME_PER_FLOOR
        moveOneFloor(elevator, change);
        i++;
        setTimeout(() => {
          stopTimer(elevator);
          arrivedElevator(elevator, targetFloor);
        }, TIME_PER_FLOOR);
      }
    }, TIME_PER_FLOOR);
  };

  const bringElevatorToTarget = (elevator, targetFloor) => {
    // Set elevator status to occupied
    setState({
      setterFunction: setElevatorStatus,
      index: elevator,
      newValue: ELEVATOR_STATUS_ENUM.OCCUPIED,
    });

    // Elevator current location
    const currentFloor = elevatorLocations[elevator];
    // If target floor is above current floor move by 1 - else -1
    const change = targetFloor > currentFloor ? 1 : -1;
    // How many floors the elevator has to go
    const distance = Math.abs(currentFloor - targetFloor);

    startTimer(elevator);
    moveMultipleFloors({ distance, change, elevator, targetFloor });
  };

  // If exists elevator on floor returns its number, else null
  const isElevatorOnFloor = (floor) => {
    for (let i = 0; i < 5; i++) {
      if (
        elevatorLocations[i] === floor &&
        elevatorStatus[i] === ELEVATOR_STATUS_ENUM.AVAILABLE
      ) {
        return i;
      }
    }
    return null;
  };

  const moveOneFloor = (elevator, change) => {
    // Change elevator location by 1 or -1 floor
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
    // If the button is not in status 0 it's diabled anyways but this is another layer for security :-)
    if (buttonStatus[floor] !== BUTTON_STATUS_ENUM.CALL) {
      return;
    }

    const elevator = isElevatorOnFloor(floor);

    // If there already an elivator in this floor we go straight to "arrived" status
    if (elevator !== null) {
      arrivedElevator(elevator, floor);
      setState({
        setterFunction: setElevatorTime,
        index: elevator,
        newValue: { start: 0, end: 0 },
      });
    } else {
      orderElivator(floor);
    }
  };

  const orderElivator = (floor) => {
    // Set the button state to "waiting"
    setState({
      setterFunction: setButtonStatus,
      index: floor,
      newValue: BUTTON_STATUS_ENUM.WAITING,
    });
    // Adding floor to end of queue
    setQueue([...queue, floor]);
  };

  // Generic function that operates "setterFunction" on its previous value
  // Changes item on "index" to "newValue"
  const setState = ({ setterFunction, index, newValue }) => {
    setterFunction((prevStatus) => {
      return prevStatus.map((status, currentIndex) => {
        return index === currentIndex ? newValue : status;
      });
    });
  };

  const startTimer = (elevator) => {
    const start = Date.now();
    // Set start time state of current elevator to now
    setElevatorTime((prevTime) => {
      return prevTime.map((time, index) => {
        return index === elevator ? { ...time, start } : time;
      });
    });
  };

  const stopTimer = (elevator) => {
    const end = Date.now();
    // Set end time state of current elevator to now
    setElevatorTime((prevTime) => {
      return prevTime.map((time, index) => {
        return index === elevator ? { ...time, end } : time;
      });
    });
  };

  return (
    <div className={styles.container}>
      <Col type="floor" numOfFloors={NUM_OF_FLOORS} />

      {[...Array(NUM_OF_ELEVATORS).keys()].map((elevator, index) => {
        return (
          <Col
            key={index}
            type="elevator"
            start={elevatorTime[elevator]["start"]}
            end={elevatorTime[elevator]["end"]}
            elevatorFloor={elevatorLocations[elevator]}
            elevatorStatus={elevatorStatus[elevator]}
          />
        );
      })}

      <Col
        type="button"
        onButtonClick={onButtonClick}
        buttonStatus={buttonStatus}
      />
    </div>
  );
}

export default Table;
