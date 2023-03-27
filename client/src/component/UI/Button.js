import React from 'react';

export const HomeButton = (props) => {
  return (
    <button
      type="button"
      className={
        'text-[var(--white)] rounded-[200px] px-9 border-[3px] border-solid hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02] transition-[transform,shadow] active:scale-[.98] ' +
        props.className
      }
      onClick={props.onClick}
    >
      {props.text}
    </button>
  );
};

const Button = (props) => {
  return (
    <button
      type={props.type}
      className={
        'text-[var(--white)] bg-[var(--dark)] rounded-[5px] shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02] transition-[transform,shadow] active:scale-[.98] ' +
        props.className
      }
      onClick={props.onClick}
    >
      {props.text}
    </button>
  );
};

export default Button;
