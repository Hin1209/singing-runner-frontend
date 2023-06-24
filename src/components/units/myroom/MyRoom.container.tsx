import { useEffect, useState } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import { userIdState } from "../../../commons/store";
import MyRoomUI from "./MyRoom.presenter";
import { IMyRoomUIProps } from './MyRoom.types';

const characters = [
  "beluga",
  "hare",
  "husky",
  "lynx",
  "narwhal",
  "puffin",
  "puma",
  "snowleopard",
];

const FETCH_USER = gql`
  query FetchUser($userId: String!) {
    fetchUser(userId: $userId) {
      userId
      userEmail
      nickname
      userActive
      userKeynote
      userMmr
      userPoint
      character
      userTier
    }
  }
`;

const UPDATE_CHARACTER = gql`
  mutation UpdateCharacter($userId: String!, $character: String!) {
    updateCharacter(userId: $userId, character: $character) {
      userId
      character
    }
  }
`;


export default function MyRoom() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [character, setCharacter] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [updateCharacterMutation] = useMutation(UPDATE_CHARACTER);
  const [tier, setTier] = useState("");
  const [mmr, setMmr] = useState(0);
  const [userId, setUserId] = useRecoilState(userIdState);
  useEffect(() => {
    setUserId(localStorage.getItem("userId") || "");
  }, []);

  const { data } = useQuery(FETCH_USER, {
    variables: { userId },
  });
  
  const onClickSetting = () => {
    router.push("/myroom/setting");
  };

  useEffect(() => {
    if (data?.fetchUser) {
      setNickname(data.fetchUser.nickname);
      localStorage.setItem("nickname", data.fetchUser.nickname);
      setCharacter(data.fetchUser.character);
      localStorage.setItem("character", data.fetchUser.character);
      setTier(data.fetchUser.userTier);
      setMmr(data.fetchUser.userMmr);
      const characterIndex = characters.findIndex(
        (char) => char === data.fetchUser.character
      );

      setCurrentImageIndex(characterIndex);
    }
  }, [data]);

  const onClickComplete = () => {
    // Call the mutation
  updateCharacterMutation({
    variables: {
      userId,
      character: characters[currentImageIndex]
    },
  })
    .then((result) => {
      // Handle the result if needed
      console.log("success userId: ", userId)
      console.log("success character: ", characters[currentImageIndex])
      console.log(result.data);
    })
    .catch((error) => {
      // Handle any errors
      console.log("failure userId: ", userId)
      console.log("failure character: ", characters[currentImageIndex])
      console.error(error);
    });

    router.push("/main");
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % characters.length);
    console.log(characters[currentImageIndex])
  };
  
  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + characters.length) % characters.length);
  };
  

  const props: IMyRoomUIProps = {
    onClickComplete,
    userData: { ...data?.fetchUser, nickname },
    onClickSetting,
    characters,
    currentImageIndex,
    handlePreviousImage,
    handleNextImage,
    character,
    tier,
    mmr,
  };

  return <MyRoomUI {...props} />;
}
