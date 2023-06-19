import * as S from "./Game.styles";
import { IGameUIProps } from "./Game.types";
import ItemList from "./itemList/ItemList";
import RankList from "./rankList/rankList";
import ItemInfo from "./itemInfo/ItemInfo";
import Lyric from "./lyric/Lyric";
import Graphic from "./graphic/Graphic";
import { useEffect, useState } from "react";

export default function GameUI(props: IGameUIProps) {
  // 아이템이 활성화 되어 있을 때, 화면 테두리 애니메이션을 보여주기 위한 상태
  const [isItemActivated, setIsItemActivated] = useState(false);
  useEffect(() => {
    setIsItemActivated(Object.values(props.activeItem).some((value) => value));
  }, [props.activeItem]);

  return (
    <>
      {!props.isLoadComplete && ( // 로딩 화면
        <>
          <S.LoadingBackground>
            <S.LoadingMessage>잠시만 기다려주세요.</S.LoadingMessage>
            <S.LoadingBarWrapper>
              Loading...
              <S.LoadingBar>
                <S.LoadingGauge
                  style={{
                    width: `${Number(props.progress)}%`,
                  }}
                />
              </S.LoadingBar>
            </S.LoadingBarWrapper>
            <S.MatchButtonWrapper></S.MatchButtonWrapper>
          </S.LoadingBackground>
        </>
      )}
      {props.isLoadComplete && (
        // 로딩화면 끝, 게임 시작
        <>
          <Graphic
            playersScore={props.playersScore}
            totalPlayers={props.totalPlayers}
            activeItem={props.activeItem}
            setActiveItem={props.setActiveItem}
            playersActiveItem={props.playersActiveItem}
            offItem={props.offItem}
            decibel={props.decibel}
          />
          <S.Wrapper>
            {isItemActivated && <S.ItemEffectWrapper />}
            {/* ⭐️ 제목 - 가수 */}
            <S.Title>짱구는 못말려 - Various Artists</S.Title>
            <Lyric
              startTime={props.startTime}
              currentTime={props.currentTime}
            />
            <ItemInfo activeItem={props.activeItem} decibel={props.decibel} />
            <RankList
              playersActiveItem={props.playersActiveItem}
              playersScore={props.playersScore}
            />
            <ItemList itemList={props.itemList} useItem={props.useItem} />
          </S.Wrapper>
        </>
      )}
    </>
  );
}
