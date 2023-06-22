import * as S from "./Button.styles";
interface IButtonProps {
  buttonType: buttonType;
  text?: string;
  onClick?: () => void;
  isFixedAtBottom?: boolean; // 화면의 맨 밑에 붙어있는 버튼
  isFixedAtBottomSecond?: boolean; // 화면의 맨 밑에 있는 버튼 바로 위의 버튼
  children?: React.ReactNode;
}
export enum buttonType {
  "GRADATION",
  "EMPTY",
  "DISABLED",
  "ONECOLOR",
  "SEARCH",
  "SELECT",
  "SHORT",
  "SHORT_PINK",
  "SHORT_DISABLED",
  "FILTER",
}

export default function Button(props: IButtonProps) {
  return (
    <S.Button
      onClick={props.onClick}
      buttonType={props.buttonType}
      isFixedAtBottom={props.isFixedAtBottom}
      isFixedAtBottomSecond={props.isFixedAtBottomSecond}
    >
      {props.buttonType === buttonType.SELECT ? (
        <>
          <S.SelectIcon src="/icon/triangle.png" alt="triangle" />
          {props.text}
          <S.SelectIcon isRight src="/icon/triangle.png" alt="triangle" />
        </>
      ) : props.buttonType === buttonType.SEARCH ? (
        <>
          <S.SearchIcon src="/icon/search.png" alt="triangle" />
          {props.text}
          <S.Empty />
        </>
      ) : props.buttonType === buttonType.FILTER ? (
        <>
          <S.SelectIcon small src="/icon/triangle-black.png" alt="triangle" />
          {props.text}
          <S.SelectIcon
            small
            isRight
            src="/icon/triangle-black.png"
            alt="triangle"
          />
        </>
      ) : (
        props.children ?? props.text
      )}
    </S.Button>
  );
}
