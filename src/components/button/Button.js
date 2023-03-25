import styles from "./Button.module.css";

function Button({ status, onClick }) {
  const buttonsNames = {
    0: "call",
    1: "waiting",
    2: "arrived",
  };

  return (
    <button
      onClick={onClick}
      className={`${styles.button} ${styles[buttonsNames[status]]}`}
      disabled={status !== 0}
    >
      {buttonsNames[status]}
    </button>
  );
}

export default Button;
