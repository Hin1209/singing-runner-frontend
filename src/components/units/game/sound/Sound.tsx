import { useEffect, useState, useRef, useContext } from "react";
import PitchAndDecibel from "./PitchAndDecibel";
import { SocketContext } from "../../../../commons/contexts/SocketContext";
import { useRecoilValue } from "recoil";
import { userInfoState } from "../../../../commons/store";
import {
  ISocketGameSongData,
  ISocketLoadingData,
  ISoundProps,
} from "./Sound.types";

export default function Sound(props: ISoundProps) {
  const socketContext = useContext(SocketContext);
  if (!socketContext) return <div>Loading...</div>;
  const { socket } = socketContext;

  const userInfo = useRecoilValue(userInfoState);

  const [isKeyUp, setKeyUp] = useState(false);
  const [isKeyDown, setKeyDown] = useState(false);
  const [isFrozen, setFrozen] = useState(false);
  const [isMute, setMute] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodes = useRef<GainNode[]>([]);
  const sources = useRef<AudioBufferSourceNode[]>([]);
  const [originAnswer, setOriginAnswer] = useState<number[]>([]);
  const [keyUpAnswer, setKeyUpAnswer] = useState<number[]>([]);
  const [keyDownAnswer, setKeyDownAnswer] = useState<number[]>([]);

  useEffect(() => {
    // 값이 true인 속성의 키 찾기(현재 실행되고 있는 아이템)
    for (const key in props.activeItem) {
      if (Object.prototype.hasOwnProperty.call(props.activeItem, key)) {
        switch (key) {
          case "keyUp":
            if (props.activeItem[key]) setKeyUp(true);
            else setKeyUp(false);
            break;
          case "keyDown":
            if (props.activeItem[key]) setKeyDown(true);
            else setKeyDown(false);
            break;
          case "frozen":
            if (props.activeItem[key]) setFrozen(true);
            else setFrozen(false);
            break;
          case "mute":
            if (props.activeItem[key]) setMute(true);
            else setMute(false);
        }
      }
    }
  }, [props.activeItem]);

  useEffect(() => {
    if (socket) {
      socket.emit("loading");
      audioCtxRef.current = new window.AudioContext();
      const audioCtx = audioCtxRef.current;
      /** 입장한 게임의 MR, 정답 데이터, 유저 정보(id & 캐릭터) 조회 */
      const fetchRoomInfo = async (data: ISocketLoadingData) => {
        try {
          // 정답 데이터
          getAnswerData(data.gameSong); // 🚨 정답 데이터 받을 때 쓰세요
          const ans1 = await fetch("/origin.txt");
          const ans2 = await fetch("/keyUp.txt");
          const ans3 = await fetch("/keyDown.txt");
          const ans1Text = await ans1.text();
          const ans2Text = await ans2.text();
          const ans3Text = await ans3.text();
          const ans1Array = ans1Text.split(",").map((value) => Number(value));
          setOriginAnswer(ans1Array);
          const ans2Array = ans2Text.split(",").map((value) => Number(value));
          setKeyUpAnswer(ans2Array);
          const ans3Array = ans3Text.split(",").map((value) => Number(value));
          setKeyDownAnswer(ans3Array);

          // MR 파일
          const songFiles = getMR(data.gameSong);

          const response = await Promise.all(
            songFiles.map(async (file, idx) => {
              const result = await fetch(file);
              props.setProgress((prev) => {
                if (idx === 2) return 100;
                return props.progress + 30;
              });
              return result;
            })
          );

          const arrayBuffers = await Promise.all(
            response.map((res) => res.arrayBuffer())
          );
          const audioBuffers = await Promise.all(
            arrayBuffers.map((data) => {
              return audioCtx.decodeAudioData(data);
            })
          );

          gainNodes.current = audioBuffers.map((buffer, i) => {
            const gainNode = audioCtx.createGain();
            gainNode.gain.value = 0; // Start all audios muted
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(gainNode).connect(audioCtx.destination);
            sources.current[i] = source;
            if (i === 0) {
              gainNode.gain.value = 1;
            }
            return gainNode;
          });

          // 유저 정보
          props.setPlayersInfo((prev) => {
            const newPlayersInfo = [...prev];
            data.characterList.forEach((el, i) => {
              // 현재 유저 제외하고 저장
              if (el.userId !== userInfo.userId)
                newPlayersInfo.push({
                  userId: data.characterList[i].userId,
                  character: data.characterList[i].character,
                  activeItem: "",
                  score: 0,
                });
            });
            return newPlayersInfo;
          });

          // 곡 정보
          props.setSongInfo({
            title: data.gameSong.songTitle,
            singer: data.gameSong.singer,
          });

          // 로딩 완료 신호 보내기
          socket?.emit("game_ready");
        } catch (err) {
          console.log(err);
        }
      };

      socket.on("loading", fetchRoomInfo);
    }
  }, [socket]);

  const getMR = (gameSong: ISocketGameSongData) => {
    let keyOrigin: string;
    let keyUp: string;
    let keyDown: string;
    switch (userInfo.userKeynote) {
      case "male":
        keyOrigin = gameSong.songMale;
        keyUp = gameSong.songMaleUp;
        keyDown = gameSong.songMaleDown;
        break;
      case "female":
        keyOrigin = gameSong.songFemale;
        keyUp = gameSong.songFemaleUp;
        keyDown = gameSong.songFemaleDown;
        break;
      default:
        keyOrigin =
          gameSong.songGender === 0 ? gameSong.songMale : gameSong.songFemale;
        keyUp =
          gameSong.songGender === 0
            ? gameSong.songMaleUp
            : gameSong.songFemaleUp;
        keyDown =
          gameSong.songGender === 0
            ? gameSong.songMaleDown
            : gameSong.songFemaleDown;
        break;
    }
    return [keyOrigin, keyUp, keyDown];
  };

  const getAnswerData = (gameSong: ISocketGameSongData) => {
    let answerOrigin: number[];
    let answerUp: number[];
    let answerDown: number[];
    switch (userInfo.userKeynote) {
      case "male":
        answerOrigin = gameSong.vocalMale;
        answerUp = gameSong.vocalMaleUp;
        answerDown = gameSong.vocalMaleDown;
        break;
      case "female":
        answerOrigin = gameSong.vocalFemale;
        answerUp = gameSong.vocalFemaleUp;
        answerDown = gameSong.vocalFemaleDown;
        break;
      default:
        answerOrigin =
          gameSong.songGender === 0 ? gameSong.vocalMale : gameSong.vocalFemale;
        answerUp =
          gameSong.songGender === 0
            ? gameSong.vocalMaleUp
            : gameSong.vocalFemaleUp;
        answerDown =
          gameSong.songGender === 0
            ? gameSong.vocalMaleDown
            : gameSong.vocalFemaleDown;
        break;
    }
    return [answerOrigin, answerUp, answerDown];
  };

  const changeMRKey = (index: number) => {
    gainNodes.current.forEach((gainNode, i) => {
      gainNode.gain.value = i === index ? 1 : 0;
    });
  };

  useEffect(() => {
    if (props.mrKey === "origin") changeMRKey(0);
    else if (props.mrKey === "keyUp") changeMRKey(1);
    else if (props.mrKey === "keyDown") changeMRKey(2);
  }, [props.mrKey]);

  return (
    <>
      <PitchAndDecibel
        setPlayersInfo={props.setPlayersInfo}
        isLoadComplete={props.isLoadComplete}
        originAnswer={originAnswer}
        keyUpAnswer={keyUpAnswer}
        keyDownAnswer={keyDownAnswer}
        isKeyUp={isKeyUp}
        isKeyDown={isKeyDown}
        isFrozen={isFrozen}
        isMute={isMute}
        setKeyUp={setKeyUp}
        setKeyDown={setKeyDown}
        setFrozen={setFrozen}
        setMute={setMute}
        setDecibel={props.setDecibel}
        sources={sources}
        setIsLoadComplete={props.setIsLoadComplete}
        setStartTime={props.setStartTime}
      />
    </>
  );
}
