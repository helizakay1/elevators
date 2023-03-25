import { useEffect, useState } from "react";
import Button from "../button/Button";
import styles from "./Table.module.css";
import ElevatorIconSVG from "../elevatorIconSVG/ElevatorIconSVG";

function Table() {
  const elevatorSound = new Audio("/elevator.mp3");
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

  const [elevatorLocations, setElevatorLocations] = useState([0, 0, 0, 0, 0]);
  const [elevatorStatus, setElevatorStatus] = useState([0, 0, 0, 0, 0]);
  const [buttonStatus, setButtonStatus] = useState([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const moveOneFloor = (elevator, direction) => {
      setElevatorLocations((prevLocations) => {
        const newElevatorLocation = prevLocations.map((location, index) => {
          if (index === elevator) {
            if (direction === 1) {
              return prevLocations[elevator] + 1;
            }
            return prevLocations[elevator] - 1;
          }
          return location;
        });

        return newElevatorLocation;
      });
    };
    const bringElevatorToTarget = (elevator, targetFloor) => {
      const currentFloor = elevatorLocations[elevator];
      const direction = targetFloor > currentFloor ? 1 : 0;

      const distance = Math.abs(currentFloor - targetFloor);

      var i = 0;

      function loop() {
        setTimeout(function () {
          moveOneFloor(elevator, direction);
          i++;

          if (i < distance) {
            loop();
          } else {
            elevatorSound.play();
            setButtonStatus((prevStatus) => {
              const newStatus = prevStatus.map((status, index) => {
                return index === targetFloor ? 2 : status;
              });
              return newStatus;
            });
            setTimeout(() => {
              setElevatorStatus((prevStatus) => {
                return prevStatus.map((status, index) => {
                  return index === elevator ? 0 : status;
                });
              });
              setButtonStatus((prevStatus) => {
                return prevStatus.map((status, index) => {
                  return index === targetFloor ? 0 : status;
                });
              });
            }, 2000);
          }
        }, 1000);
      }
      if (distance > 0) {
        loop();
      }
    };
    const interval = setInterval(() => {
      if (queue.length > 0) {
        const floorNeedsElevator = queue[0];
        let minDist = 1000;
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
        if (chosenElevator !== null) {
          elevatorStatus[chosenElevator] = 1;
          bringElevatorToTarget(chosenElevator, floorNeedsElevator);

          setQueue(
            queue.filter((floor, index) => {
              return index !== 0;
            })
          );
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [queue, elevatorLocations, elevatorStatus]);

  const isElevatorHere = (elevator, floor) => {
    if (elevatorLocations[elevator] === floor) {
      return true;
    }
    return false;
  };

  const isElevatorOnFloor = (floor) => {
    const found = elevatorLocations.filter((location) => {
      return location === floor;
    });
    return found.length > 0;
  };

  const onButtonClick = (floor) => {
    if (buttonStatus[floor] === 0) {
      if (isElevatorOnFloor(floor)) {
        setButtonStatus((prevStatus) => {
          return prevStatus.map((status, index) => {
            return index === floor ? 2 : status;
          });
        });
        setTimeout(() => {
          setButtonStatus((prevStatus) => {
            return prevStatus.map((status, index) => {
              return index === floor ? 0 : status;
            });
          });
        }, 2000);
      } else {
        setButtonStatus((prevStatus) => {
          return prevStatus.map((status, index) => {
            return index === floor ? 1 : status;
          });
        });
        setQueue([...queue, floor]);
      }
    }
  };

  return (
    <table className={styles.table}>
      <tbody>
        {[...Array(10).keys()].map((floor) => {
          return (
            <tr key={floor}>
              <td>
                <h4>{FLOORS[floor]}</h4>
              </td>
              {[...Array(5).keys()].map((elevator) => {
                return (
                  <td className={styles.cell} key={elevator}>
                    {isElevatorHere(elevator, floor) ? (
                      <ElevatorIconSVG />
                    ) : null}
                  </td>
                );
              })}
              <td>
                <Button
                  status={buttonStatus[floor]}
                  onClick={() => onButtonClick(floor)}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default Table;
